import { Notification } from '../models/Notification.js';
import { toSocketAppointment } from '../serializers/appointmentSerializer.js';

let ioInstance = null;

export const setSocketServer = (io) => {
  ioInstance = io;
};

export const getSocketServer = () => {
  return ioInstance;
};

/**
 * Persist in-app notification in DB and emit in real-time to recipient socket room
 */
export const sendAndPersistNotification = async ({
  userId,
  professionalId,
  recipientRole,
  type,
  title,
  message,
  link = '',
  appointmentId = null,
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      userId: userId || undefined,
      professionalId: professionalId || undefined,
      recipientRole,
      type,
      title,
      message,
      link,
      appointmentId,
      metadata,
    });

    if (ioInstance) {
      if (userId) {
        ioInstance.to(`user:${userId.toString()}`).emit('notification:new', notification);
      }
      if (professionalId) {
        ioInstance.to(`professional:${professionalId.toString()}`).emit('notification:new', notification);
      }
      if (recipientRole === 'ADMIN') {
        ioInstance.to('admin:ops').emit('notification:new', notification);
        ioInstance.to('role:admin').emit('notification:new', notification);
      }
    }

    return notification;
  } catch (err) {
    console.error('[SocketEmitter] Error persisting notification:', err.message);
    return null;
  }
};

/**
 * Appointment Created Event
 * Emitted strictly to professional room, admin:ops, and user (if authenticated).
 * Never broadcast globally.
 */
export const emitAppointmentCreated = async (appointment, professional, user = null) => {
  if (!ioInstance) return;

  const sanitizedAppointment = toSocketAppointment(appointment);

  const payload = {
    event: 'appointment:created',
    appointment: sanitizedAppointment,
    professional: {
      id: professional._id,
      name: professional.name,
      profession: professional.profession,
      specialization: professional.specialization,
      bookingSlug: professional.bookingSlug,
    },
    user: user
      ? {
          id: user._id,
          name: user.name || appointment.customerName,
          email: user.email || appointment.customerEmail,
        }
      : null,
    timestamp: new Date().toISOString(),
  };

  // 1. Notify professional
  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:created', payload);

  // 2. Notify user if authenticated
  if (appointment.userId) {
    const userId = appointment.userId.toString();
    ioInstance.to(`user:${userId}`).emit('appointment:created', payload);
  }

  // 3. Notify admin ops
  ioInstance.to('admin:ops').emit('appointment:created', payload);
  ioInstance.to('role:admin').emit('appointment:created', payload);
  ioInstance.to('admin:ops').emit('admin:activity', {
    type: 'APPOINTMENT_CREATED',
    message: `New appointment booked for ${professional.name} by ${appointment.customerName} on ${appointment.dateString} at ${appointment.startTime}`,
    appointmentId: appointment._id,
    timestamp: new Date().toISOString(),
  });

  // Save persistent in-app notifications
  await sendAndPersistNotification({
    professionalId: professional._id,
    recipientRole: 'PROFESSIONAL',
    type: 'APPOINTMENT_CREATED',
    title: 'New Appointment Booked',
    message: `${appointment.customerName} booked ${appointment.appointmentTypeName || 'Appointment'} for ${appointment.dateString} at ${appointment.startTime}`,
    link: '/dashboard',
    appointmentId: appointment._id,
    metadata: { appointmentCode: appointment.appointmentCode },
  });

  if (appointment.userId) {
    await sendAndPersistNotification({
      userId: appointment.userId,
      recipientRole: 'USER',
      type: 'APPOINTMENT_CREATED',
      title: 'Appointment Request Submitted',
      message: `Your appointment with ${professional.name} is scheduled for ${appointment.dateString} at ${appointment.startTime}. Status: ${appointment.status}`,
      link: '/dashboard',
      appointmentId: appointment._id,
      metadata: { appointmentCode: appointment.appointmentCode },
    });
  }
};

/**
 * Appointment Confirmed Event (e.g. Pro accepts request)
 */
export const emitAppointmentConfirmed = async (appointment, professional, user = null) => {
  if (!ioInstance) return;

  const sanitizedAppointment = toSocketAppointment(appointment);

  const payload = {
    event: 'appointment:confirmed',
    appointment: sanitizedAppointment,
    professional: {
      id: professional._id,
      name: professional.name,
    },
    timestamp: new Date().toISOString(),
  };

  const statusPayload = {
    appointmentId: appointment._id,
    status: 'CONFIRMED',
    appointment: sanitizedAppointment,
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:confirmed', payload);
  ioInstance.to(`appointment:${apptId}`).emit('appointment:status_changed', statusPayload);

  if (appointment.userId) {
    const userId = appointment.userId.toString();
    ioInstance.to(`user:${userId}`).emit('appointment:confirmed', payload);
    ioInstance.to(`user:${userId}`).emit('appointment:status_changed', statusPayload);
  }

  if (appointment.appointmentCode) {
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:confirmed', payload);
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:status_changed', statusPayload);
  }

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:confirmed', payload);
  ioInstance.to(`professional:${proId}`).emit('appointment:status_changed', statusPayload);

  ioInstance.to('admin:ops').emit('appointment:confirmed', payload);
  ioInstance.to('role:admin').emit('appointment:confirmed', payload);

  // Persistent Notification for User
  if (appointment.userId) {
    await sendAndPersistNotification({
      userId: appointment.userId,
      recipientRole: 'USER',
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Appointment Confirmed! 🎉',
      message: `Dr./Pro ${professional.name} confirmed your appointment for ${appointment.dateString} at ${appointment.startTime}`,
      link: '/dashboard',
      appointmentId: appointment._id,
      metadata: { appointmentCode: appointment.appointmentCode },
    });
  }
};

/**
 * Appointment Rejected Event
 */
export const emitAppointmentRejected = async (appointment, professional, reason = '') => {
  if (!ioInstance) return;

  const sanitizedAppointment = toSocketAppointment(appointment);

  const payload = {
    event: 'appointment:rejected',
    appointment: sanitizedAppointment,
    reason,
    timestamp: new Date().toISOString(),
  };

  const statusPayload = {
    appointmentId: appointment._id,
    status: 'REJECTED',
    appointment: sanitizedAppointment,
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:rejected', payload);
  ioInstance.to(`appointment:${apptId}`).emit('appointment:status_changed', statusPayload);

  if (appointment.userId) {
    const userId = appointment.userId.toString();
    ioInstance.to(`user:${userId}`).emit('appointment:rejected', payload);
    ioInstance.to(`user:${userId}`).emit('appointment:status_changed', statusPayload);

    await sendAndPersistNotification({
      userId: appointment.userId,
      recipientRole: 'USER',
      type: 'APPOINTMENT_REJECTED',
      title: 'Appointment Request Declined',
      message: `${professional.name} could not accept your appointment for ${appointment.dateString}. ${reason ? `Reason: ${reason}` : ''}`,
      link: '/dashboard',
      appointmentId: appointment._id,
    });
  }

  if (appointment.appointmentCode) {
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:rejected', payload);
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:status_changed', statusPayload);
  }

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:rejected', payload);
  ioInstance.to(`professional:${proId}`).emit('appointment:status_changed', statusPayload);

  ioInstance.to('admin:ops').emit('appointment:rejected', payload);
  ioInstance.to('role:admin').emit('appointment:rejected', payload);
};

/**
 * Appointment Cancelled Event
 */
export const emitAppointmentCancelled = async (appointment, professional, cancelledBy = 'USER', reason = '') => {
  if (!ioInstance) return;

  const sanitizedAppointment = toSocketAppointment(appointment);

  const payload = {
    event: 'appointment:cancelled',
    appointment: sanitizedAppointment,
    cancelledBy,
    reason,
    timestamp: new Date().toISOString(),
  };

  const statusPayload = {
    appointmentId: appointment._id,
    status: 'CANCELLED',
    appointment: sanitizedAppointment,
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:cancelled', payload);
  ioInstance.to(`appointment:${apptId}`).emit('appointment:status_changed', statusPayload);

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:cancelled', payload);
  ioInstance.to(`professional:${proId}`).emit('appointment:status_changed', statusPayload);

  if (appointment.userId) {
    const userId = appointment.userId.toString();
    ioInstance.to(`user:${userId}`).emit('appointment:cancelled', payload);
    ioInstance.to(`user:${userId}`).emit('appointment:status_changed', statusPayload);
  }

  if (appointment.appointmentCode) {
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:cancelled', payload);
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:status_changed', statusPayload);
  }

  ioInstance.to('admin:ops').emit('appointment:cancelled', payload);
  ioInstance.to('role:admin').emit('appointment:cancelled', payload);
  ioInstance.to('admin:ops').emit('admin:activity', {
    type: 'APPOINTMENT_CANCELLED',
    message: `Appointment #${appointment.appointmentCode} was cancelled by ${cancelledBy}. ${reason ? `(${reason})` : ''}`,
    appointmentId: appointment._id,
    timestamp: new Date().toISOString(),
  });

  // Persist notification for the other party
  if (cancelledBy === 'USER') {
    await sendAndPersistNotification({
      professionalId: professional._id,
      recipientRole: 'PROFESSIONAL',
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment Cancelled',
      message: `${appointment.customerName} cancelled their appointment for ${appointment.dateString} at ${appointment.startTime}`,
      link: '/dashboard',
      appointmentId: appointment._id,
    });
  } else {
    if (appointment.userId) {
      await sendAndPersistNotification({
        userId: appointment.userId,
        recipientRole: 'USER',
        type: 'APPOINTMENT_CANCELLED',
        title: 'Appointment Cancelled',
        message: `Your appointment with ${professional.name} on ${appointment.dateString} was cancelled. ${reason ? `Reason: ${reason}` : ''}`,
        link: '/dashboard',
        appointmentId: appointment._id,
      });
    }
  }
};

/**
 * Appointment Rescheduled Event
 */
export const emitAppointmentRescheduled = async (appointment, professional) => {
  if (!ioInstance) return;

  const sanitizedAppointment = toSocketAppointment(appointment);

  const payload = {
    event: 'appointment:rescheduled',
    appointment: sanitizedAppointment,
    professional: {
      id: professional._id,
      name: professional.name,
    },
    timestamp: new Date().toISOString(),
  };

  const statusPayload = {
    appointmentId: appointment._id,
    status: 'RESCHEDULED',
    appointment: sanitizedAppointment,
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:rescheduled', payload);
  ioInstance.to(`appointment:${apptId}`).emit('appointment:status_changed', statusPayload);

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:rescheduled', payload);
  ioInstance.to(`professional:${proId}`).emit('appointment:status_changed', statusPayload);

  if (appointment.userId) {
    const userId = appointment.userId.toString();
    ioInstance.to(`user:${userId}`).emit('appointment:rescheduled', payload);
    ioInstance.to(`user:${userId}`).emit('appointment:status_changed', statusPayload);

    await sendAndPersistNotification({
      userId: appointment.userId,
      recipientRole: 'USER',
      type: 'APPOINTMENT_RESCHEDULED',
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${professional.name} has been moved to ${appointment.dateString} at ${appointment.startTime}`,
      link: '/dashboard',
      appointmentId: appointment._id,
    });
  }

  if (appointment.appointmentCode) {
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:rescheduled', payload);
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:status_changed', statusPayload);
  }

  ioInstance.to('admin:ops').emit('appointment:rescheduled', payload);
  ioInstance.to('role:admin').emit('appointment:rescheduled', payload);
};

/**
 * Appointment Reschedule Request Event (from User to Pro)
 */
export const emitAppointmentRescheduleRequested = async (appointment, professional, requestDetails) => {
  if (!ioInstance) return;

  const sanitizedAppointment = toSocketAppointment(appointment);

  const payload = {
    event: 'appointment:reschedule_requested',
    appointment: sanitizedAppointment,
    requestDetails,
    timestamp: new Date().toISOString(),
  };

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:reschedule_requested', payload);

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:reschedule_requested', payload);

  if (appointment.userId) {
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:reschedule_requested', payload);
  }

  if (appointment.appointmentCode) {
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:reschedule_requested', payload);
  }

  ioInstance.to('admin:ops').emit('appointment:reschedule_requested', payload);
  ioInstance.to('role:admin').emit('appointment:reschedule_requested', payload);

  await sendAndPersistNotification({
    professionalId: professional._id,
    recipientRole: 'PROFESSIONAL',
    type: 'APPOINTMENT_RESCHEDULE_REQUESTED',
    title: 'Reschedule Request',
    message: `${appointment.customerName} requested to reschedule appointment to ${requestDetails.requestedDate} at ${requestDetails.requestedTime}`,
    link: '/dashboard',
    appointmentId: appointment._id,
  });
};

/**
 * Appointment Completed Event
 */
export const emitAppointmentCompleted = async (appointment, professional) => {
  if (!ioInstance) return;

  const sanitizedAppointment = toSocketAppointment(appointment);

  const payload = {
    event: 'appointment:completed',
    appointment: sanitizedAppointment,
    timestamp: new Date().toISOString(),
  };

  const statusPayload = {
    appointmentId: appointment._id,
    status: 'COMPLETED',
    appointment: sanitizedAppointment,
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:completed', payload);
  ioInstance.to(`appointment:${apptId}`).emit('appointment:status_changed', statusPayload);

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:completed', payload);
  ioInstance.to(`professional:${proId}`).emit('appointment:status_changed', statusPayload);

  if (appointment.userId) {
    const userId = appointment.userId.toString();
    ioInstance.to(`user:${userId}`).emit('appointment:completed', payload);
    ioInstance.to(`user:${userId}`).emit('appointment:status_changed', statusPayload);

    await sendAndPersistNotification({
      userId: appointment.userId,
      recipientRole: 'USER',
      type: 'APPOINTMENT_COMPLETED',
      title: 'Consultation Completed',
      message: `Your appointment with ${professional.name} on ${appointment.dateString} has been marked as completed. Thank you!`,
      link: '/dashboard',
      appointmentId: appointment._id,
    });
  }

  if (appointment.appointmentCode) {
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:completed', payload);
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:status_changed', statusPayload);
  }

  ioInstance.to('admin:ops').emit('appointment:completed', payload);
  ioInstance.to('role:admin').emit('appointment:completed', payload);
};

/**
 * Generic Status Change
 */
export const emitAppointmentStatusChanged = async (appointment, professional, status) => {
  if (!ioInstance) return;

  const sanitizedAppointment = toSocketAppointment(appointment);

  const payload = {
    event: 'appointment:status_changed',
    appointmentId: appointment._id,
    status,
    appointment: sanitizedAppointment,
    timestamp: new Date().toISOString(),
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:status_changed', payload);

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:status_changed', payload);

  if (appointment.userId) {
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:status_changed', payload);
  }

  if (appointment.appointmentCode) {
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('appointment:status_changed', payload);
  }

  ioInstance.to('admin:ops').emit('appointment:status_changed', payload);
  ioInstance.to('role:admin').emit('appointment:status_changed', payload);
};

/**
 * Live Queue Updated Event
 */
export const emitQueueUpdated = async ({ professionalId, bookingSlug, dateString, queueStatus }) => {
  if (!ioInstance) return;

  const payload = {
    event: 'queue:updated',
    professionalId,
    bookingSlug,
    dateString,
    queueStatus,
    timestamp: new Date().toISOString(),
  };

  if (bookingSlug) {
    ioInstance.to(`public:booking:${bookingSlug}`).emit('queue:updated', payload);
  }
  if (professionalId) {
    ioInstance.to(`professional:${professionalId.toString()}`).emit('queue:updated', payload);
  }
};

/**
 * Token Called Event
 */
export const emitQueueCalled = async ({ professionalId, bookingSlug, dateString, queueNumber, appointment }) => {
  if (!ioInstance) return;

  const payload = {
    event: 'queue:called',
    professionalId,
    bookingSlug,
    dateString,
    queueNumber,
    appointment: appointment ? toSocketAppointment(appointment) : null,
    timestamp: new Date().toISOString(),
  };

  if (bookingSlug) {
    ioInstance.to(`public:booking:${bookingSlug}`).emit('queue:called', payload);
  }
  if (professionalId) {
    ioInstance.to(`professional:${professionalId.toString()}`).emit('queue:called', payload);
  }
  if (appointment?.appointmentCode) {
    ioInstance.to(`booking:${appointment.appointmentCode}`).emit('queue:called', payload);
  }
  if (appointment?.userId) {
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('queue:called', payload);
  }
};
