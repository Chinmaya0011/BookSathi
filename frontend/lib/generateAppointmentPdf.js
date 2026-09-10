import { jsPDF } from 'jspdf';
import { formatDisplayDate, format12Hour, formatINR } from './utils';

/**
 * Generates an official, beautifully styled PDF appointment confirmation receipt.
 * Optimized with high-priority sensitive data (Date, Time, Payment) in the header section,
 * followed by Doctor Details (with optional Google Maps clinic navigation link) and Patient Details.
 *
 * @param {Object} appointment
 * @param {Object} profile
 */
export function generateAppointmentPdf(appointment, profile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Palette Tokens
  const primaryIndigo = [67, 56, 202]; // #4338ca (Indigo 700)
  const darkNavy = [15, 23, 42]; // #0f172a (Slate 900)
  const textMuted = [100, 116, 139]; // #64748b (Slate 500)
  const emeraldGreen = [16, 185, 129]; // #10b981 (Emerald 500)
  const amberOrange = [217, 119, 6]; // #d97706 (Amber 600)
  const blueLink = [37, 99, 235]; // #2563eb (Blue 600)
  const bgSlate50 = [248, 250, 252]; // Slate 50
  const bgIndigoLight = [238, 242, 255]; // Indigo 50
  const borderSlate200 = [226, 232, 240]; // Slate 200
  const borderIndigo200 = [199, 210, 254]; // Indigo 200

  const isPaidOnline = appointment.paymentStatus === 'PAID';
  const feeAmount = appointment.fee || profile?.consultationFee || 0;
  const appointmentCode = appointment.appointmentCode || 'CONFIRMED';
  const mapUrl = profile?.googleMapUrl || '';
  const issuedDate = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // ========================================================
  // 1. TOP HEADER BRANDING BANNER (0mm - 32mm)
  // ========================================================
  doc.setFillColor(...primaryIndigo);
  doc.rect(0, 0, 210, 32, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BookSaathi', 18, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text('Official Appointment Confirmation & Digital Admission Pass', 18, 23);

  // Appointment Reference Badge (Top Right)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(136, 7, 56, 18, 2.5, 2.5, 'F');

  doc.setTextColor(...primaryIndigo);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('APPOINTMENT TOKEN / REF', 140, 13);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(appointmentCode, 140, 20);

  // =========================================================================
  // 2. HIGHLIGHTED SENSITIVE INFO SECTION: DATE, TIME & PAYMENT (36mm - 86mm)
  // =========================================================================
  const sensitiveBoxY = 36;
  const sensitiveBoxH = 48;

  // Outer Highlight Box with Accent Border
  doc.setFillColor(...bgIndigoLight);
  doc.setDrawColor(...borderIndigo200);
  doc.setLineWidth(0.6);
  doc.roundedRect(18, sensitiveBoxY, 174, sensitiveBoxH, 3, 3, 'FD');

  // Top Section Title Strip
  doc.setFillColor(...primaryIndigo);
  doc.roundedRect(18, sensitiveBoxY, 174, 8, 3, 3, 'F');
  doc.rect(18, sensitiveBoxY + 4, 174, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('★ PRIORITY SCHEDULE & PAYMENT VERIFICATION', 22, sensitiveBoxY + 5.5);

  // Sub-badge: Issued Date
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text(`Issued: ${issuedDate} IST`, 130, sensitiveBoxY + 5.5);

  // Column 1: Date & Time Schedule (Left)
  const col1X = 24;
  const contentY = sensitiveBoxY + 14;

  doc.setTextColor(...textMuted);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('APPOINTMENT DATE & TIME (IST):', col1X, contentY);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(12.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDisplayDate(appointment.date), col1X, contentY + 7);

  doc.setTextColor(...primaryIndigo);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(format12Hour(appointment.startTime), col1X, contentY + 14);

  doc.setTextColor(...textMuted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Duration: ${appointment.duration || 30} Mins  •  In-Person Consultation`,
    col1X,
    contentY + 20
  );

  // Vertical Divider
  doc.setDrawColor(...borderIndigo200);
  doc.setLineWidth(0.4);
  doc.line(105, sensitiveBoxY + 11, 105, sensitiveBoxY + sensitiveBoxH - 3);

  // Column 2: Payment Details (Right)
  const col2X = 112;

  doc.setTextColor(...textMuted);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSULTATION CHARGES & STATUS:', col2X, contentY);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(formatINR(feeAmount), col2X, contentY + 7);

  // Payment Status Pill
  if (isPaidOnline) {
    doc.setFillColor(...emeraldGreen);
    doc.roundedRect(col2X, contentY + 10, 48, 6.5, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ PAID ONLINE', col2X + 6, contentY + 14.5);
  } else {
    doc.setFillColor(...amberOrange);
    doc.roundedRect(col2X, contentY + 10, 56, 6.5, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAY AT CLINIC (CASH/UPI)', col2X + 4, contentY + 14.5);
  }

  doc.setTextColor(...textMuted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const payRef = appointment.paymentId || (isPaidOnline ? 'Online Gateway' : 'Pay during check-in');
  doc.text(`Payment Ref: ${payRef}`, col2X, contentY + 22);

  // ========================================================
  // 3. DOCTOR & CLINIC DETAILS (88mm - 136mm)
  // ========================================================
  const doctorBoxY = 88;
  const doctorBoxH = mapUrl ? 48 : 42;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderSlate200);
  doc.setLineWidth(0.4);
  doc.roundedRect(18, doctorBoxY, 174, doctorBoxH, 3, 3, 'FD');

  // Header strip for Doctor section
  doc.setFillColor(...darkNavy);
  doc.roundedRect(18, doctorBoxY, 174, 7.5, 3, 3, 'F');
  doc.rect(18, doctorBoxY + 4, 174, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('1. PRACTITIONER & CLINIC INFORMATION', 22, doctorBoxY + 5);

  const docContentY = doctorBoxY + 13;

  doc.setTextColor(...darkNavy);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(profile?.name || 'Healthcare Practitioner', 24, docContentY);

  doc.setTextColor(...primaryIndigo);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  const specText = [profile?.profession, profile?.specialization].filter(Boolean).join(' • ');
  doc.text(specText || 'Doctor / Specialist', 24, docContentY + 6);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const clinicAddress = [profile?.address, profile?.city].filter(Boolean).join(', ') || 'Practitioner Consultation Clinic';
  doc.text(doc.splitTextToSize(`Clinic / Hospital: ${clinicAddress}`, 162), 24, docContentY + 12);

  if (mapUrl) {
    // Render Google Maps Navigation Link
    doc.setTextColor(...blueLink);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.textWithLink('📍 Open Location in Google Maps (Click for Directions)', 24, docContentY + 19, {
      url: mapUrl,
    });
    // Add underline
    doc.setDrawColor(...blueLink);
    doc.setLineWidth(0.2);
    doc.line(24, docContentY + 20, 102, docContentY + 20);

    doc.setTextColor(...textMuted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Practitioner ID: ${profile?.bookingSlug || 'booksaathi'}`, 24, docContentY + 28);
    if (profile?.phone) {
      doc.text(`Clinic Helpline: ${profile.phone}`, 112, docContentY + 28);
    }
  } else {
    doc.setTextColor(...textMuted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Practitioner ID: ${profile?.bookingSlug || 'booksaathi'}`, 24, docContentY + 22);
    if (profile?.phone) {
      doc.text(`Clinic Helpline: ${profile.phone}`, 112, docContentY + 22);
    }
  }

  // ========================================================
  // 4. PATIENT / CLIENT DETAILS
  // ========================================================
  const patientBoxY = doctorBoxY + doctorBoxH + 4;
  const patientBoxH = 42;

  doc.setFillColor(...bgSlate50);
  doc.setDrawColor(...borderSlate200);
  doc.setLineWidth(0.4);
  doc.roundedRect(18, patientBoxY, 174, patientBoxH, 3, 3, 'FD');

  // Header strip for Patient section
  doc.setFillColor(...darkNavy);
  doc.roundedRect(18, patientBoxY, 174, 7.5, 3, 3, 'F');
  doc.rect(18, patientBoxY + 4, 174, 3.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('2. PATIENT / CLIENT INFORMATION', 22, patientBoxY + 5);

  const patContentY = patientBoxY + 13;

  doc.setTextColor(...textMuted);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT NAME:', 24, patContentY);
  doc.text('CONTACT PHONE:', 24, patContentY + 8);
  doc.text('EMAIL ADDRESS:', 24, patContentY + 16);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(appointment.customerName || 'N/A', 56, patContentY);
  doc.text(appointment.customerPhone || 'N/A', 56, patContentY + 8);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.customerEmail || 'Not Provided', 56, patContentY + 16);

  // Column 2 inside Patient Card
  doc.setTextColor(...textMuted);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE TYPE:', 112, patContentY);
  doc.text('CHIEF REASON / NOTE:', 112, patContentY + 8);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(appointment.appointmentTypeName || 'General Consultation', 148, patContentY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const reasonText = appointment.reason || 'Routine Consultation & Checkup';
  doc.text(doc.splitTextToSize(reasonText, 40), 148, patContentY + 8);

  // ========================================================
  // 5. IMPORTANT PATIENT GUIDELINES
  // ========================================================
  const guideBoxY = patientBoxY + patientBoxH + 4;
  const guideBoxH = mapUrl ? 46 : 46;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderSlate200);
  doc.setLineWidth(0.4);
  doc.roundedRect(18, guideBoxY, 174, guideBoxH, 3, 3, 'FD');

  doc.setTextColor(...primaryIndigo);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT PATIENT ADVISORY & CHECK-IN RULES', 24, guideBoxY + 7.5);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(7.8);
  doc.setFont('helvetica', 'normal');

  const instructions = [
    '• 1. Reporting Time: Please arrive at the clinic reception 10-15 minutes prior to your booked slot.',
    '• 2. Identification: Show this PDF slip or mention Token Code at reception desk upon arrival.',
    '• 3. Prior Records: Kindly carry any previous prescriptions, medical history, or lab reports.',
    '• 4. Billing: If paying at clinic, please settle charges (Cash/UPI) at reception counter during check-in.',
    mapUrl
      ? '• 5. Clinic Navigation: Click the blue Google Maps link in Section 1 for turn-by-turn directions.'
      : '• 5. Rescheduling & Cancellation: To reschedule, contact the practitioner at least 2 hours prior.',
  ];

  instructions.forEach((line, i) => {
    doc.text(line, 24, guideBoxY + 14 + i * 6);
  });

  // ========================================================
  // 6. OFFICIAL FOOTER & VERIFICATION STAMP
  // ========================================================
  const footerY = 270;
  doc.setDrawColor(...borderSlate200);
  doc.setLineWidth(0.4);
  doc.line(18, footerY, 192, footerY);

  doc.setTextColor(...textMuted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'BookSaathi Professional & Healthcare Network • Digitally verified confirmation token.',
    18,
    footerY + 5
  );
  doc.text(
    'This is a computer-generated admission slip and does not require a physical signature.',
    18,
    footerY + 9
  );

  doc.setTextColor(...primaryIndigo);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('https://booksaathi.in', 162, footerY + 5);

  // Save / Download PDF with sanitized filename
  const cleanCode = appointmentCode.replace(/[^a-zA-Z0-9-_]/g, '');
  const fileName = `BookSaathi-Slip-${cleanCode || 'Appointment'}.pdf`;
  doc.save(fileName);
}
