import * as ics from 'ics';

/**
 * Generate iCalendar (.ics) string for an appointment
 */
export const createIcsCalendarEvent = (appointment, profile) => {
  return new Promise((resolve, reject) => {
    const [year, month, day] = appointment.dateString.split('-').map(Number);
    const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
    const durationMinutes = appointment.duration || 30;

    const event = {
      start: [year, month, day, startHour, startMinute],
      duration: { minutes: durationMinutes },
      title: `Appointment with ${profile.name} (${appointment.appointmentTypeName || 'Consultation'})`,
      description: `Appointment Details:\n- Professional: ${profile.name} (${profile.profession})\n- Type: ${appointment.appointmentTypeName}\n- Appointment Code: ${appointment.appointmentCode}\n- Reason: ${appointment.reason || 'General'}\n\nManaged via BookSaathi.in`,
      location: profile.address ? `${profile.businessName || profile.name}, ${profile.address}, ${profile.city}, ${profile.state}` : (profile.onlineConsultation ? 'Online Consultation' : 'In-Person Consultation'),
      url: `https://booksaathi.in/book/${profile.bookingSlug}`,
      organizer: { name: profile.name, email: profile.email },
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
    };

    ics.createEvent(event, (error, value) => {
      if (error) {
        return reject(error);
      }
      resolve(value);
    });
  });
};
