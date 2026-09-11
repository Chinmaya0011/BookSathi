import nodemailer from 'nodemailer';
import { Notification } from '../models/Notification.js';
import { format12Hour, formatIndianDate } from '../utils/dateHelpers.js';

let transporter = null;

// Initialize Nodemailer transporter
if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Send email notification with automatic fallback logging
 */
export const sendEmail = async ({ to, subject, html, text, type, role, appointmentId }) => {
  try {
    const from = process.env.EMAIL_FROM || 'BookSaathi <noreply@booksaathi.in>';

    let status = 'SENT';
    let errorMsg = '';

    if (transporter) {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
    } else {
      // Mock/Dev Log
      console.log(`\n================== [EMAIL DISPATCHED (${type})] ==================`);
      console.log(`To: ${to} (${role})`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text || html}`);
      console.log(`=================================================================\n`);
    }

    // Persist Notification record
    const validRole = role === 'CUSTOMER' ? 'USER' : role;
    await Notification.create({
      recipientEmail: to,
      recipientRole: validRole,
      type: 'APPOINTMENT_CREATED',
      title: subject,
      message: text || subject,
      appointmentId,
    }).catch((err) => {});

    return true;
  } catch (err) {
    console.error('[EmailService Error]', err.message);
    return false;
  }
};

/**
 * Send booking confirmation emails to both customer and professional
 */
export const sendBookingNotifications = async (appointment, profile, options = {}) => {
  const formattedDate = formatIndianDate(appointment.dateString);
  const timeFormatted = format12Hour(appointment.startTime);
  const manageUrl =
    options.manageUrl ||
    (options.cancelToken
      ? `/book/manage?code=${appointment.appointmentCode}&token=${options.cancelToken}`
      : `/book/manage?code=${appointment.appointmentCode}`);

  // 1. Send to Customer (if email provided)
  if (appointment.customerEmail) {
    const customerSubject = `Appointment Confirmed with ${profile.name} - ${appointment.appointmentCode}`;
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4338ca; margin-top: 0;">Appointment Confirmed!</h2>
        <p>Dear <strong>${appointment.customerName}</strong>,</p>
        <p>Your appointment with <strong>${profile.name}</strong> (${profile.profession}) has been confirmed successfully.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Appointment Code:</strong> <span style="color: #4338ca; font-weight: bold;">${appointment.appointmentCode}</span></p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${timeFormatted}</p>
          <p style="margin: 5px 0;"><strong>Service:</strong> ${appointment.appointmentTypeName || 'Consultation'}</p>
          <p style="margin: 5px 0;"><strong>Consultation Fee:</strong> ₹${appointment.fee}</p>
        </div>
        <p style="margin: 20px 0;">
          <a href="${manageUrl}" style="display: inline-block; background-color: #4338ca; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;">Manage or Cancel Appointment</a>
        </p>
        <p style="color: #64748b; font-size: 13px;">Use the secure link above to manage or reschedule your appointment at any time without logging in.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">Powered by BookSaathi.in — India's simple appointment platform</p>
      </div>
    `;

    await sendEmail({
      to: appointment.customerEmail,
      subject: customerSubject,
      html: customerHtml,
      text: `Your appointment with ${profile.name} is confirmed for ${formattedDate} at ${timeFormatted}. Code: ${appointment.appointmentCode}. Manage your booking: ${manageUrl}`,
      type: 'BOOKING_CONFIRMED',
      role: 'CUSTOMER',
      appointmentId: appointment._id,
    });
  }

  // 2. Send to Professional
  if (profile.email) {
    const proSubject = `New Booking: ${appointment.customerName} on ${formattedDate} at ${timeFormatted}`;
    const proHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669; margin-top: 0;">New Appointment Booked!</h2>
        <p>Hi <strong>${profile.name}</strong>,</p>
        <p>A new client has booked an appointment through your BookSaathi booking link.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Client Name:</strong> ${appointment.customerName}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${appointment.customerPhone}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${appointment.customerEmail || 'Not provided'}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${timeFormatted}</p>
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${appointment.reason || 'None specified'}</p>
          <p style="margin: 5px 0;"><strong>Appointment Code:</strong> ${appointment.appointmentCode}</p>
        </div>
        <p><a href="http://localhost:3000/dashboard/appointments" style="display: inline-block; background-color: #4338ca; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Dashboard</a></p>
      </div>
    `;

    await sendEmail({
      to: profile.email,
      subject: proSubject,
      html: proHtml,
      text: `New booking: ${appointment.customerName} booked for ${formattedDate} at ${timeFormatted}. Phone: ${appointment.customerPhone}`,
      type: 'BOOKING_CONFIRMED',
      role: 'PROFESSIONAL',
      appointmentId: appointment._id,
    });
  }
};
