import { jsPDF } from 'jspdf';
import { formatDisplayDate, format12Hour, formatINR } from './utils';

/**
 * Generates an executive-grade, minimalist, clean PDF admission receipt or Queue Token Pass.
 * Prominently features both Date and Time together in the priority schedule section.
 *
 * Supports:
 * 1. Queue Token Pass (prominent Token Number #, Queue Date, Operating Hours, Turnaround, Live Tracking)
 * 2. Time-Slot Appointment Pass (Prominent Date & Time Slot together, Duration, Payment & Clinic Directions)
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

  const isQueue =
    appointment.bookingType === 'QUEUE' ||
    Boolean(appointment.queueNumber) ||
    profile?.bookingType === 'QUEUE';

  const queueNumber = appointment.queueNumber || appointment.tokenNumber || 1;

  // ---------------------------------------------------------------------
  // Premium Palette Tokens (refined for a professional, printable pass)
  // ---------------------------------------------------------------------
  const primaryColor = [67, 56, 202];     // Indigo 700 — brand / accent
  const primaryDeep = [49, 41, 157];      // Indigo 800 — band shading
  const primarySoft = [238, 237, 252];    // Indigo 50 — soft tint fills
  const darkNavy = [15, 23, 42];          // Slate 900 — primary ink
  const slate700 = [51, 65, 85];          // Slate 700 — body text
  const textMuted = [100, 116, 139];      // Slate 500 — secondary text
  const surfaceBg = [250, 250, 252];      // near-white card fill
  const borderLight = [225, 228, 236];    // hairline borders
  const emeraldGreen = [5, 150, 105];     // Emerald 600 — success / paid
  const amberOrange = [180, 83, 9];       // Amber 700 — pending / due
  const white = [255, 255, 255];

  const isPaidOnline = appointment.paymentStatus === 'PAID';
  const feeAmount = appointment.fee || appointment.amount || profile?.consultationFee || 0;
  const appointmentCode = appointment.appointmentCode || 'CONFIRMED';
  const mapUrl = profile?.googleMapUrl || '';

  const formatPdfCurrency = (amount) => {
    if (amount === 0) return 'FREE';
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  // Resolve appointment date safely (handles Date object, ISO string, YYYY-MM-DD)
  const rawDate =
    appointment.date ||
    appointment.dateString ||
    appointment.appointmentDate ||
    new Date();
  const formattedFullDate = formatDisplayDate(rawDate, true); // e.g. "Thu, 18 Sep 2026"

  const issuedDate = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Small helper — a slim colored tab on the left edge of a card, used
  // consistently across sections for a coherent "ticket stub" identity.
  const drawAccentTab = (x, y, h) => {
    doc.setFillColor(...primaryColor);
    doc.roundedRect(x, y, 1.6, h, 0.8, 0.8, 'F');
  };

  // ========================================================
  // 1. BRAND BAND HEADER (0mm – 34mm)
  // ========================================================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 34, 'F');
  // subtle deeper shade along the very top for dimension
  doc.setFillColor(...primaryDeep);
  doc.rect(0, 0, 210, 1.2, 'F');

  doc.setTextColor(...white);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BookSaathi', 18, 16);

  doc.setFontSize(7.3);
  doc.setFont('helvetica', 'bold');
  const badgeText = isQueue ? 'DIGITAL QUEUE PASS' : 'APPOINTMENT CONFIRMATION';
  doc.setTextColor(226, 232, 255);
  doc.text(badgeText, 18, 22.5);

  doc.setTextColor(199, 199, 246);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official verified pass issued on ${issuedDate} IST`, 18, 28);

  // Top-Right Reference Box (white card floating on the brand band)
  doc.setFillColor(...white);
  doc.roundedRect(132, 7, 60, 21, 2.5, 2.5, 'F');

  doc.setTextColor(...textMuted);
  doc.setFontSize(6.3);
  doc.setFont('helvetica', 'bold');
  doc.text(isQueue ? 'QUEUE REF CODE' : 'BOOKING REFERENCE', 136, 13.5);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(appointmentCode, 136, 20.5);

  doc.setTextColor(...emeraldGreen);
  doc.setFontSize(6.3);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMED & ACTIVE', 136, 25.5);

  // =========================================================================
  // 2. HERO PRIORITY CARD: DATE + TIME / QUEUE TOKEN (37mm - 87mm)
  // =========================================================================
  const heroCardY = 37;
  const heroCardH = 50;

  // Outer Container
  doc.setFillColor(...white);
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.35);
  doc.roundedRect(18, heroCardY, 174, heroCardH, 3, 3, 'FD');
  drawAccentTab(18, heroCardY + 3, heroCardH - 6);

  if (isQueue) {
    // -------------------------------------------------------------
    // QUEUE MODE: TOKEN STAMP + PROMINENT DATE & HOURS
    // -------------------------------------------------------------
    // Left Token Number Stamp
    doc.setFillColor(...primarySoft);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.6);
    doc.roundedRect(24, heroCardY + 5, 54, 40, 2.5, 2.5, 'FD');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('QUEUE TOKEN PASS', 30, heroCardY + 11);

    // Large Crisp Token Number
    doc.setTextColor(...primaryColor);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    const tokenStr = `#${queueNumber}`;
    const tokenOffset = queueNumber >= 100 ? 30 : queueNumber >= 10 ? 35 : 40;
    doc.text(tokenStr, tokenOffset, heroCardY + 23);

    // Date inside Token Stamp
    doc.setTextColor(...darkNavy);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(formattedFullDate, 27, heroCardY + 31);

    doc.setTextColor(...emeraldGreen);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('LIVE ADMISSION', 33, heroCardY + 38);

    // Vertical Divider
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.3);
    doc.line(84, heroCardY + 5, 84, heroCardY + heroCardH - 5);

    // Right Side Information Grid
    const col2X = 90;
    const infoY = heroCardY + 11;

    // Row 1: QUEUE DATE & OPERATING HOURS
    doc.setTextColor(...textMuted);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('QUEUE DATE', col2X, infoY);
    doc.text('OPERATING HOURS', col2X + 52, infoY);

    doc.setTextColor(...darkNavy);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(formattedFullDate, col2X, infoY + 5.5);

    const qStart = profile?.queueSettings?.queueStartTime || '09:00';
    const qEnd = profile?.queueSettings?.queueEndTime || '18:00';
    doc.text(`${format12Hour(qStart)} - ${format12Hour(qEnd)}`, col2X + 52, infoY + 5.5);

    // Row 2: SERVICE TYPE & ESTIMATED TURNAROUND
    const infoY2 = infoY + 14;
    doc.setTextColor(...textMuted);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE TYPE', col2X, infoY2);
    doc.text('ESTIMATED TURNAROUND', col2X + 52, infoY2);

    const serviceName = appointment.appointmentTypeName || 'General Consultation';
    doc.setTextColor(...darkNavy);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(doc.splitTextToSize(serviceName, 48), col2X, infoY2 + 5);

    const avgMins = profile?.queueSettings?.estimatedServiceTimeMinutes || 15;
    doc.setTextColor(...slate700);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`~${avgMins} mins / patient`, col2X + 52, infoY2 + 5);

    // Row 3: CONSULTATION FEE & PAYMENT STATUS
    const infoY3 = infoY2 + 13;
    doc.setTextColor(...textMuted);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('CONSULTATION FEE', col2X, infoY3);

    doc.setTextColor(...darkNavy);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPdfCurrency(feeAmount), col2X, infoY3 + 5.5);

    // Payment Status Pill (Bottom right of hero)
    if (isPaidOnline) {
      doc.setFillColor(...emeraldGreen);
      doc.roundedRect(col2X + 52, infoY3, 36, 5, 1.5, 1.5, 'F');
      doc.setTextColor(...white);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PAID ONLINE', col2X + 56, infoY3 + 3.5);
    } else {
      doc.setFillColor(...amberOrange);
      doc.roundedRect(col2X + 52, infoY3, 44, 5, 1.5, 1.5, 'F');
      doc.setTextColor(...white);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PAY ON ARRIVAL', col2X + 55.5, infoY3 + 3.5);
    }
  } else {
    // -------------------------------------------------------------
    // TIME SLOT MODE: PROMINENT DATE + SCHEDULED TIME TOGETHER
    // -------------------------------------------------------------
    // Left Schedule Box (Both Date and Time Prominently Highlighted)
    doc.setFillColor(...primarySoft);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.6);
    doc.roundedRect(24, heroCardY + 5, 62, 40, 2.5, 2.5, 'FD');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('APPOINTMENT SCHEDULE', 28, heroCardY + 11);

    // Prominent Full Date
    doc.setTextColor(...darkNavy);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text(formattedFullDate, 28, heroCardY + 18);

    // Prominent Time Slot
    doc.setTextColor(...primaryColor);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const startTimeFormatted = appointment.startTime ? format12Hour(appointment.startTime) : '';
    const endTimeFormatted = appointment.endTime ? format12Hour(appointment.endTime) : '';
    const timeSlotDisplay = (startTimeFormatted && endTimeFormatted)
      ? `${startTimeFormatted} - ${endTimeFormatted}`
      : (startTimeFormatted || 'Scheduled Slot');
    doc.text(timeSlotDisplay, 28, heroCardY + 26);

    doc.setTextColor(...slate700);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Duration: ${appointment.duration || 30} Mins`, 28, heroCardY + 32);

    doc.setTextColor(...emeraldGreen);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('RESERVED SLOT', 28, heroCardY + 38);

    // Vertical Divider
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.3);
    doc.line(92, heroCardY + 5, 92, heroCardY + heroCardH - 5);

    // Right Side Information
    const col2X = 98;
    const infoY = heroCardY + 11;

    // Row 1: APPOINTMENT DATE & TIME
    doc.setTextColor(...textMuted);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIRMED DATE', col2X, infoY);
    doc.text('CONFIRMED TIME', col2X + 46, infoY);

    doc.setTextColor(...darkNavy);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(formattedFullDate, col2X, infoY + 5.5);
    doc.text(timeSlotDisplay, col2X + 46, infoY + 5.5);

    // Row 2: SERVICE TYPE
    const infoY2 = infoY + 14;
    doc.setTextColor(...textMuted);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE TYPE', col2X, infoY2);

    const serviceName = appointment.appointmentTypeName || 'General Consultation';
    doc.setTextColor(...darkNavy);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(doc.splitTextToSize(serviceName, 80), col2X, infoY2 + 5);

    // Row 3: CONSULTATION FEE & PAYMENT STATUS
    const infoY3 = infoY2 + 13;
    doc.setTextColor(...textMuted);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('CONSULTATION FEE', col2X, infoY3);

    doc.setTextColor(...darkNavy);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPdfCurrency(feeAmount), col2X, infoY3 + 5.5);

    // Payment Status Pill
    if (isPaidOnline) {
      doc.setFillColor(...emeraldGreen);
      doc.roundedRect(col2X + 46, infoY3, 36, 5, 1.5, 1.5, 'F');
      doc.setTextColor(...white);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PAID ONLINE', col2X + 50, infoY3 + 3.5);
    } else {
      doc.setFillColor(...amberOrange);
      doc.roundedRect(col2X + 46, infoY3, 44, 5, 1.5, 1.5, 'F');
      doc.setTextColor(...white);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PAY AT CLINIC', col2X + 49.5, infoY3 + 3.5);
    }
  }

  // ========================================================
  // 3. PRACTITIONER & CLINIC DETAILS (92mm - 140mm)
  // ========================================================
  const docCardY = 92;
  const docCardH = mapUrl ? 44 : 38;

  doc.setFillColor(...white);
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.35);
  doc.roundedRect(18, docCardY, 174, docCardH, 2.5, 2.5, 'FD');
  drawAccentTab(18, docCardY + 3, docCardH - 6);

  // Header Title
  doc.setTextColor(...primaryColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PRACTITIONER & CLINIC LOCATION', 24, docCardY + 7);

  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.2);
  doc.line(24, docCardY + 9, 186, docCardY + 9);

  // Content
  const docBodyY = docCardY + 16;
  doc.setTextColor(...darkNavy);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(profile?.name || 'Healthcare Practitioner', 24, docBodyY);

  doc.setTextColor(...primaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const specText = [profile?.profession, profile?.specialization].filter(Boolean).join(' - ');
  doc.text(specText || 'Doctor / Specialist', 24, docBodyY + 5.5);

  doc.setTextColor(...slate700);
  doc.setFontSize(7.8);
  doc.setFont('helvetica', 'normal');
  const clinicAddress = [profile?.address, profile?.city].filter(Boolean).join(', ') || 'Consultation Clinic & Facility';
  doc.text(doc.splitTextToSize(`Address: ${clinicAddress}`, 160), 24, docBodyY + 11);

  if (mapUrl) {
    doc.setTextColor(...primaryColor);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.textWithLink('Open Location in Google Maps (Click for Directions)', 24, docBodyY + 18, {
      url: mapUrl,
    });
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.2);
    doc.line(24, docBodyY + 18.8, 98, docBodyY + 18.8);

    if (profile?.phone) {
      doc.setTextColor(...textMuted);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`Clinic Helpline: ${profile.phone}`, 120, docBodyY + 18);
    }
  } else if (profile?.phone) {
    doc.setTextColor(...textMuted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Clinic Helpline: ${profile.phone}`, 24, docBodyY + 17);
  }

  // ========================================================
  // 4. PATIENT & SERVICE INFORMATION (140mm - 186mm)
  // ========================================================
  const patCardY = docCardY + docCardH + 4;
  const patCardH = 40;

  doc.setFillColor(...surfaceBg);
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.35);
  doc.roundedRect(18, patCardY, 174, patCardH, 2.5, 2.5, 'FD');
  drawAccentTab(18, patCardY + 3, patCardH - 6);

  doc.setTextColor(...primaryColor);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT / VISITOR DETAILS', 24, patCardY + 7);

  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.2);
  doc.line(24, patCardY + 9, 186, patCardY + 9);

  const patBodyY = patCardY + 16;

  // Extract robust patient details
  const customerName = (appointment.customerName || appointment.patientName || appointment.name || 'Visitor').trim();
  const customerPhone = (appointment.customerPhone || appointment.patientPhone || appointment.phone || 'N/A').trim();
  const customerEmail = (appointment.customerEmail || appointment.patientEmail || appointment.email || 'Not Provided').trim();

  // Column 1: Patient Name & Phone
  doc.setTextColor(...textMuted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT NAME:', 24, patBodyY);
  doc.text('CONTACT PHONE:', 24, patBodyY + 8);
  doc.text('EMAIL ADDRESS:', 24, patBodyY + 16);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(customerName, 56, patBodyY);
  doc.text(customerPhone, 56, patBodyY + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(customerEmail, 56, patBodyY + 16);

  // Column 2: Service, Schedule & Notes
  const colPat2 = 110;
  doc.setTextColor(...textMuted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE TYPE:', colPat2, patBodyY);
  doc.text(isQueue ? 'QUEUE DATE:' : 'SCHEDULED ON:', colPat2, patBodyY + 8);
  doc.text('REASON / NOTE:', colPat2, patBodyY + 16);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(appointment.appointmentTypeName || 'General Consultation', colPat2 + 28, patBodyY);

  const scheduleSummary = isQueue
    ? formattedFullDate
    : `${formattedFullDate} • ${appointment.startTime ? format12Hour(appointment.startTime) : 'Confirmed Slot'}`;
  doc.text(scheduleSummary, colPat2 + 28, patBodyY + 8);

  doc.setFontSize(7.8);
  doc.setFont('helvetica', 'normal');
  const reasonStr = appointment.reason || 'Routine Consultation & Checkup';
  doc.text(doc.splitTextToSize(reasonStr, 44), colPat2 + 28, patBodyY + 16);

  // ========================================================
  // 5. IMPORTANT PATIENT ADVISORY (190mm - 240mm)
  // ========================================================
  const guideCardY = patCardY + patCardH + 4;
  const guideCardH = 44;

  doc.setFillColor(...white);
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.35);
  doc.roundedRect(18, guideCardY, 174, guideCardH, 2.5, 2.5, 'FD');
  drawAccentTab(18, guideCardY + 3, guideCardH - 6);

  doc.setTextColor(...darkNavy);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isQueue
      ? 'IMPORTANT QUEUE CHECK-IN INSTRUCTIONS'
      : 'IMPORTANT APPOINTMENT CHECK-IN RULES',
    24,
    guideCardY + 7
  );

  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.2);
  doc.line(24, guideCardY + 9, 186, guideCardY + 9);

  doc.setTextColor(...slate700);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');

  const rules = isQueue
    ? [
      `1. Sequential Queue: Tokens are called in order (#1, #2, #3...). Present Token #${queueNumber} at the desk.`,
      '2. Reporting Time: Please arrive at the clinic 15-20 minutes before your expected consultation turn.',
      '3. Live Progress: Check the live screen at the clinic or your online pass for real-time queue tracking.',
      '4. Payment: If unpaid, settle charges (Cash/UPI) directly at the reception counter upon check-in.',
    ]
    : [
      '1. Reporting Time: Please report to the reception 10-15 minutes prior to your reserved slot.',
      '2. Identification: Present this PDF slip or mention your Booking Reference at the reception desk.',
      '3. Prior Records: Please carry past prescriptions, medical records, or test reports if applicable.',
      '4. Payment: If paying at clinic, settle consultation charges during desk check-in.',
    ];

  rules.forEach((line, i) => {
    doc.text(line, 24, guideCardY + 16 + i * 6.5);
  });

  // ========================================================
  // 6. MINIMALIST EXECUTIVE FOOTER
  // ========================================================
  const footerY = 272;
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.4);
  doc.line(18, footerY, 192, footerY);

  doc.setTextColor(...textMuted);
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'BookSaathi Professional Appointment & Live Queue Network • Digitally verified computer-generated pass.',
    18,
    footerY + 5.5
  );
  doc.text(
    'No physical signature required. For support or queries, visit booksaathi.in.',
    18,
    footerY + 9.5
  );

  doc.setTextColor(...primaryColor);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('https://booksaathi.in', 160, footerY + 5.5);

  // Download PDF
  const cleanCode = appointmentCode.replace(/[^a-zA-Z0-9-_]/g, '');
  const fileName = isQueue
    ? `BookSaathi-Token-#${queueNumber}-${cleanCode || 'Pass'}.pdf`
    : `BookSaathi-Pass-${cleanCode || 'Appointment'}.pdf`;

  doc.save(fileName);
}