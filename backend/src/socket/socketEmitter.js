import { Notification } from '../models/Notification.js';

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
 */
export const emitAppointmentCreated = async (appointment, professional, user = null) => {
  if (!ioInstance) return;

  const payload = {
    event: 'appointment:created',
    appointment,
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

  // Notify professional
  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:created', payload);

  // Notify user if authenticated
  if (appointment.userId) {
    const userId = appointment.userId.toString();
    ioInstance.to(`user:${userId}`).emit('appointment:created', payload);
  }

  // Notify admin channel for real-time monitoring
  ioInstance.to('role:admin').emit('appointment:created', payload);
  ioInstance.to('role:admin').emit('admin:activity', {
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
    message: `${appointment.customerName} booked ${appointment.appointmentTypeName} for ${appointment.dateString} at ${appointment.startTime}`,
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

  const payload = {
    event: 'appointment:confirmed',
    appointment,
    professional: {
      id: professional._id,
      name: professional.name,
    },
    timestamp: new Date().toISOString(),
  };

  // Broadcast to appointment room, user room, and admin room
  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:confirmed', payload);
  ioInstance.to(`appointment:${apptId}`).emit('appointment:status_changed', {
    appointmentId: appointment._id,
    status: 'CONFIRMED',
  });

  if (appointment.userId) {
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:confirmed', payload);
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:status_changed', {
      appointmentId: appointment._id,
      status: 'CONFIRMED',
    });
  }

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:confirmed', payload);
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

  const payload = {
    event: 'appointment:rejected',
    appointment,
    reason,
    timestamp: new Date().toISOString(),
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:rejected', payload);

  if (appointment.userId) {
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:rejected', payload);
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:status_changed', {
      appointmentId: appointment._id,
      status: 'REJECTED',
    });

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

  ioInstance.to('role:admin').emit('appointment:rejected', payload);
};

/**
 * Appointment Cancelled Event
 */
export const emitAppointmentCancelled = async (appointment, professional, cancelledBy = 'USER', reason = '') => {
  if (!ioInstance) return;

  const payload = {
    event: 'appointment:cancelled',
    appointment,
    cancelledBy,
    reason,
    timestamp: new Date().toISOString(),
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:cancelled', payload);

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:cancelled', payload);

  if (appointment.userId) {
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:cancelled', payload);
  }

  ioInstance.to('role:admin').emit('appointment:cancelled', payload);
  ioInstance.to('role:admin').emit('admin:activity', {
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

  const payload = {
    event: 'appointment:rescheduled',
    appointment,
    professional: {
      id: professional._id,
      name: professional.name,
    },
    timestamp: new Date().toISOString(),
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:rescheduled', payload);

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:rescheduled', payload);

  if (appointment.userId) {
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:rescheduled', payload);

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

  ioInstance.to('role:admin').emit('appointment:rescheduled', payload);
};

/**
 * Appointment Reschedule Request Event (from User to Pro)
 */
export const emitAppointmentRescheduleRequested = async (appointment, professional, requestDetails) => {
  if (!ioInstance) return;

  const payload = {
    event: 'appointment:reschedule_requested',
    appointment,
    requestDetails,
    timestamp: new Date().toISOString(),
  };

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:reschedule_requested', payload);

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

  const payload = {
    event: 'appointment:completed',
    appointment,
    timestamp: new Date().toISOString(),
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:completed', payload);

  if (appointment.userId) {
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:completed', payload);

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

  ioInstance.to('role:admin').emit('appointment:completed', payload);
};

/**
 * Generic Status Change
 */
export const emitAppointmentStatusChanged = async (appointment, professional, status) => {
  if (!ioInstance) return;

  const payload = {
    event: 'appointment:status_changed',
    appointmentId: appointment._id,
    status,
    appointment,
    timestamp: new Date().toISOString(),
  };

  const apptId = appointment._id.toString();
  ioInstance.to(`appointment:${apptId}`).emit('appointment:status_changed', payload);

  const proId = (professional._id || professional).toString();
  ioInstance.to(`professional:${proId}`).emit('appointment:status_changed', payload);

  if (appointment.userId) {
    ioInstance.to(`user:${appointment.userId.toString()}`).emit('appointment:status_changed', payload);
  }

  ioInstance.to('role:admin').emit('appointment:status_changed', payload);
};
