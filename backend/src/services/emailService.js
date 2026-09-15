import nodemailer from 'nodemailer';
import { Notification } from '../models/Notification.js';
import { format12Hour, formatIndianDate } from '../utils/dateHelpers.js';

let transporter = null;

// Initialize Nodemailer transporter with Gmail and custom SMTP support
export const getTransporter = () => {
  if (!transporter && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    const user = process.env.SMTP_USER.trim();
    const pass = process.env.SMTP_PASSWORD.replace(/\s+/g, '');
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';

    if (host.includes('gmail') || user.endsWith('@gmail.com')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
    } else {
      const port = Number(process.env.SMTP_PORT) || 587;
      const isSecure = port === 465;

      transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
      });
    }
  }
  return transporter;
};

/**
 * Send email notification with automatic fallback logging
 */
export const sendEmail = async ({ to, subject, html, text, type, role, appointmentId }) => {
  try {
    const from = process.env.EMAIL_FROM || `BookSaathi <${process.env.SMTP_USER || 'noreply@booksaathi.in'}>`;
    const mailer = getTransporter();

    if (mailer) {
      const info = await mailer.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Sent '${subject}' to ${to} (ID: ${info?.messageId || 'ok'})`);
    } else {
      // Mock/Dev Log
      console.log(`\n================== [EMAIL DISPATCHED (${type})] ==================`);
      console.log(`To: ${to} (${role || 'USER'})`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text || html}`);
      console.log(`=================================================================\n`);
    }

    // Persist Notification record
    const validRole = role === 'CUSTOMER' ? 'USER' : (role || 'USER');
    await Notification.create({
      recipientEmail: to,
      recipientRole: validRole,
      type: type === 'BOOKING_OTP' ? 'SYSTEM_ALERT' : 'APPOINTMENT_CREATED',
      title: subject,
      message: text || subject,
      appointmentId,
    }).catch(() => {});

    return true;
  } catch (err) {
    console.error('[EmailService Error]', err.message);
    return false;
  }
};

/**
 * Send 6-digit OTP email for appointment booking verification
 */
export const sendBookingOtpEmail = async ({ to, customerName, otp, practitionerName }) => {
  const subject = `${otp} is your BookSaathi appointment verification code`;
  const name = customerName ? customerName.trim() : 'Customer';
  const practitioner = practitionerName || 'Practitioner';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4338ca; font-size: 22px; font-weight: 800; margin: 0;">Book<span style="color: #6366f1;">Saathi</span></h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Secure Appointment Verification</p>
      </div>

      <p style="font-size: 14px; color: #1e293b; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 20px 0;">
        Use the following one-time password (OTP) to confirm your appointment request with <strong>${practitioner}</strong>:
      </p>

      <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #312e81; font-family: monospace;">${otp}</span>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 16px 0 0 0; text-align: center;">
        This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
        If you did not initiate this booking on BookSaathi, please ignore this email.
      </p>
    </div>
  `;

  const text = `Hello ${name},\n\nYour BookSaathi verification code for booking with ${practitioner} is: ${otp}\n\nThis code is valid for 5 minutes.`;

  return sendEmail({
    to,
    subject,
    html,
    text,
    type: 'BOOKING_OTP',
    role: 'CUSTOMER',
  });
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

/**
 * Send password reset link email
 */
export const sendPasswordResetEmail = async ({ to, name, resetUrl, expiresMinutes = 15 }) => {
  const subject = 'Reset your BookSaathi password';
  const displayName = name ? name.trim() : 'there';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4338ca; font-size: 24px; font-weight: 900; margin: 0;">Book<span style="color: #6366f1;">Saathi</span></h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; font-weight: 500;">Practice & Booking OS</p>
      </div>

      <div style="padding: 20px 0;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Password Reset Request</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Hello <strong>${displayName}</strong>,<br />
          We received a request to reset the password for your BookSaathi account. Click the secure button below to choose a new password:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
            Reset My Password
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 20px 0 0 0;">
          Or copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all; font-size: 11px;">${resetUrl}</a>
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 24px;">
          <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
            🔒 <strong>Security Note:</strong> This reset link is valid for <strong>${expiresMinutes} minutes</strong> and will immediately expire after being used once. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
          </p>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
        © 2026 BookSaathi.in • Built for Indian Professional Practices
      </p>
    </div>
  `;

  const text = `Hello ${displayName},\n\nWe received a request to reset your BookSaathi password.\n\nPlease use the following link to reset your password:\n${resetUrl}\n\nThis link is valid for ${expiresMinutes} minutes and can only be used once.\n\nIf you did not request this, please ignore this email.`;

  return sendEmail({
    to,
    subject,
    html,
    text,
    type: 'PASSWORD_RESET',
    role: 'USER',
  });
};

/**
 * Send password changed confirmation email
 */
export const sendPasswordChangedConfirmationEmail = async ({ to, name }) => {
  const subject = 'Your BookSaathi password was successfully updated';
  const displayName = name ? name.trim() : 'there';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4338ca; font-size: 24px; font-weight: 900; margin: 0;">Book<span style="color: #6366f1;">Saathi</span></h1>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; font-weight: 500;">Practice & Booking OS</p>
      </div>

      <div style="padding: 20px 0;">
        <div style="width: 48px; height: 48px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 50%; color: #059669; font-size: 24px; text-align: center; line-height: 48px; margin: 0 auto 16px auto;">
          ✓
        </div>
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-align: center;">Password Changed Successfully</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
          Hello <strong>${displayName}</strong>, the password for your BookSaathi account has been successfully updated. All active sessions have been secured.
        </p>

        <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center;">
          If you did not perform this change, please contact our support team immediately at support@booksaathi.in.
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
        © 2026 BookSaathi.in • Built for Indian Professional Practices
      </p>
    </div>
  `;

  const text = `Hello ${displayName},\n\nYour BookSaathi password has been successfully changed.\n\nIf you did not perform this change, please contact support immediately.`;

  return sendEmail({
    to,
    subject,
    html,
    text,
    type: 'PASSWORD_CHANGED',
    role: 'USER',
  });
};
