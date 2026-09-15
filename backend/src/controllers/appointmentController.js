import {
  getProfessionalAppointments,
  updateAppointmentStatus,
  updateAppointmentNotes,
  createManualBooking,
  rescheduleAppointment,
  callNextQueueNumberService,
} from '../services/appointmentService.js';
import { Appointment } from '../models/Appointment.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import {
  toProfessionalAppointment,
} from '../serializers/appointmentSerializer.js';
import {
  emitAppointmentConfirmed,
  emitAppointmentRejected,
  emitAppointmentCancelled,
  emitAppointmentRescheduled,
  emitAppointmentCompleted,
  emitAppointmentCreated,
  emitAppointmentStatusChanged,
} from '../socket/socketEmitter.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Call Next Queue Token / Update Serving Token
 */
export const callNextQueue = async (req, res, next) => {
  try {
    const { targetQueueNumber, date, status = 'CALLED' } = req.body;
    const result = await callNextQueueNumberService({
      professionalId: req.profile._id,
      dateString: date,
      targetQueueNumber,
      status,
    });
    return successResponse(res, 200, `Called queue token #${result.currentServingNumber}`, result);
  } catch (err) {
    next(err);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    if (!req.profile) {
      return successResponse(res, 200, 'Appointments retrieved', {
        appointments: [],
        pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
      });
    }
    const result = await getProfessionalAppointments(req.profile._id, req.query);
    const serializedAppointments = result.appointments?.map(toProfessionalAppointment) || [];
    return successResponse(res, 200, 'Appointments retrieved', {
      ...result,
      appointments: serializedAppointments,
    });
  } catch (err) {
    next(err);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({
      _id: id,
      professionalId: req.profile._id,
    }).select('+notes');

    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found');
    }

    return successResponse(res, 200, 'Appointment details', toProfessionalAppointment(appointment));
  } catch (err) {
    next(err);
  }
};

/**
 * Professional Confirms / Accepts Appointment
 */
export const confirmAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id, professionalId: req.profile._id });
    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found');
    }

    appointment.status = 'BOOKED';
    appointment.confirmedAt = new Date();
    await appointment.save();

    await emitAppointmentConfirmed(appointment, req.profile);

    return successResponse(res, 200, 'Appointment confirmed successfully', appointment);
  } catch (err) {
    next(err);
  }
};

/**
 * Professional Rejects Appointment
 */
export const rejectAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;
    const appointment = await Appointment.findOne({ _id: id, professionalId: req.profile._id });
    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found');
    }

    appointment.status = 'CANCELLED';
    appointment.cancellationReason = reason;
    await appointment.save();

    await emitAppointmentCancelled(appointment, req.profile, 'PROFESSIONAL', reason);

    return successResponse(res, 200, 'Appointment cancelled', appointment);
  } catch (err) {
    next(err);
  }
};

/**
 * Professional Cancels Appointment
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;
    const appointment = await Appointment.findOne({ _id: id, professionalId: req.profile._id });
    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found');
    }

    appointment.status = 'CANCELLED';
    appointment.cancellationReason = reason;
    appointment.cancelledBy = 'PROFESSIONAL';
    appointment.cancelledAt = new Date();
    await appointment.save();

    await emitAppointmentCancelled(appointment, req.profile, 'PROFESSIONAL', reason);

    return successResponse(res, 200, 'Appointment cancelled successfully', appointment);
  } catch (err) {
    next(err);
  }
};

/**
 * Professional Marks Appointment Done / Completed
 */
export const completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id, professionalId: req.profile._id });
    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found');
    }

    appointment.status = 'DONE';
    appointment.completedAt = new Date();
    await appointment.save();

    await emitAppointmentCompleted(appointment, req.profile);

    return successResponse(res, 200, 'Appointment marked as done', appointment);
  } catch (err) {
    next(err);
  }
};

/**
 * Professional Reschedules Appointment
 */
export const reschedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await rescheduleAppointment(req.profile._id, id, req.body);
    await emitAppointmentRescheduled(updated, req.profile);
    return successResponse(res, 200, 'Appointment rescheduled successfully', updated);
  } catch (err) {
    next(err);
  }
};

/**
 * General Status Transition (BOOKED, DONE, CANCELLED)
 */
export const changeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { status, cancelReason } = req.body;
    
    // Normalize status to 3 types
    if (status === 'COMPLETED') status = 'DONE';
    if (status === 'CONFIRMED') status = 'BOOKED';

    const updated = await updateAppointmentStatus(req.profile._id, id, { status, cancelReason });
    
    if (status === 'BOOKED' || status === 'CONFIRMED') {
      await emitAppointmentConfirmed(updated, req.profile);
    } else if (status === 'CANCELLED') {
      await emitAppointmentCancelled(updated, req.profile, 'PROFESSIONAL', cancelReason);
    } else if (status === 'DONE' || status === 'COMPLETED') {
      await emitAppointmentCompleted(updated, req.profile);
    } else {
      await emitAppointmentStatusChanged(updated, req.profile, status);
    }

    return successResponse(res, 200, `Appointment status updated to ${status}`, updated);
  } catch (err) {
    next(err);
  }
};

export const saveNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const updated = await updateAppointmentNotes(req.profile._id, id, notes, 'PROFESSIONAL');
    return successResponse(res, 200, 'Private notes updated', toProfessionalAppointment(updated));
  } catch (err) {
    next(err);
  }
};

export const createManual = async (req, res, next) => {
  try {
    const newBooking = await createManualBooking(req.profile._id, req.body);
    await emitAppointmentCreated(newBooking, req.profile);
    return successResponse(res, 201, 'Walk-in booking created successfully', toProfessionalAppointment(newBooking));
  } catch (err) {
    next(err);
  }
};
