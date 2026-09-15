import { io } from 'socket.io-client';
import { toast } from 'sonner';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const token = localStorage.getItem('bs_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    socket = io(apiUrl, {
      auth: { token: token ? `Bearer ${token}` : '' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      autoConnect: false,
    });

    socket.on('connect', () => {
      // Socket connected
    });

    socket.on('connect_error', (err) => {
      // Connect error logged quietly
    });

    socket.on('notification:new', (notification) => {
      toast.info(notification.title || 'New Notification', {
        description: notification.message,
        duration: 5000,
      });
    });

    socket.on('appointment:confirmed', (data) => {
      toast.success('Appointment Confirmed! 🎉', {
        description: `Your appointment with ${data.professional?.name || 'the professional'} is confirmed.`,
        duration: 5000,
      });
    });

    socket.on('appointment:rejected', (data) => {
      toast.error('Appointment Declined', {
        description: data.reason ? `Reason: ${data.reason}` : 'The appointment request was declined.',
        duration: 5000,
      });
    });

    socket.on('appointment:cancelled', (data) => {
      toast.warning('Appointment Cancelled', {
        description: `Appointment #${data.appointment?.appointmentCode || ''} has been cancelled.`,
        duration: 5000,
      });
    });

    socket.on('appointment:rescheduled', (data) => {
      toast.info('Appointment Rescheduled 📅', {
        description: `New time: ${data.appointment?.dateString} at ${data.appointment?.startTime}`,
        duration: 5000,
      });
    });

    socket.on('appointment:completed', (data) => {
      toast.success('Consultation Completed ✨', {
        description: 'Thank you for using BookSaathi!',
        duration: 5000,
      });
    });
  }

  return socket;
};

export const connectSocket = () => {
  if (typeof window === 'undefined') return null;
  const s = getSocket();
  const token = localStorage.getItem('bs_token');
  if (s) {
    if (token) {
      s.auth = { token: `Bearer ${token}` };
    }
    if (!s.connected) {
      s.connect();
    }
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinAppointmentRoom = (appointmentId) => {
  const s = connectSocket();
  if (s && appointmentId) {
    s.emit('join:appointment', appointmentId);
  }
};

export const leaveAppointmentRoom = (appointmentId) => {
  const s = getSocket();
  if (s && appointmentId) {
    s.emit('leave:appointment', appointmentId);
  }
};

export const joinQueueRoom = (professionalId, dateString) => {
  const s = connectSocket();
  if (s && professionalId && dateString) {
    s.emit('join:queue', { professionalId, dateString });
  }
};

export const leaveQueueRoom = (professionalId, dateString) => {
  const s = getSocket();
  if (s && professionalId && dateString) {
    s.emit('leave:queue', { professionalId, dateString });
  }
};
