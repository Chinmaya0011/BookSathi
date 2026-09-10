/**
 * Generates an .ics standard calendar file download blob URL for appointments.
 * @param {Object} appointment
 * @param {Object} profile
 * @returns {string} Blob Object URL for downloading the .ics file
 */
export function createIcsDownloadUrl(appointment, profile) {
  try {
    if (!appointment || !appointment.date) return '';

    const dateStr = String(appointment.date).slice(0, 10).replace(/-/g, '');
    const startTime = (appointment.startTime || '10:00').replace(':', '') + '00';
    const durationMins = appointment.duration || 30;

    // Calculate end time
    const [sHours, sMins] = (appointment.startTime || '10:00').split(':').map(Number);
    const endMinutesTotal = sHours * 60 + sMins + durationMins;
    const endH = String(Math.floor(endMinutesTotal / 60)).padStart(2, '0');
    const endM = String(endMinutesTotal % 60).padStart(2, '0');
    const endTime = `${endH}${endM}00`;

    const summary = `Consultation with ${profile?.name || 'Practitioner'}`;
    const description = `Appointment Code: ${appointment.appointmentCode || 'N/A'}\\nService: ${
      appointment.appointmentTypeName || 'Consultation'
    }\\nPatient: ${appointment.customerName || 'N/A'}\\nBooked via BookSaathi`;
    const location = [profile?.businessName, profile?.address, profile?.city]
      .filter(Boolean)
      .join(', ') || 'Practitioner Clinic';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BookSaathi//Appointment Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${appointment._id || Date.now()}@booksaathi.in`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;TZID=Asia/Kolkata:${dateStr}T${startTime}`,
      `DTEND;TZID=Asia/Kolkata:${dateStr}T${endTime}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Failed to generate ICS download URL:', err);
    return '';
  }
}
