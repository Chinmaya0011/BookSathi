import { jsPDF } from 'jspdf';

/**
 * Generates an executive-grade, print-ready Reception Desk Standee in PDF format (A4 Portrait).
 * Formatted with precise millimeter measurements to prevent content overflow and ensure crisp print clarity.
 * 
 * @param {Object} profile 
 * @param {String} bookingUrl 
 * @param {String} qrDataUrl 
 */
export function generateReceptionStandeePdf(profile, bookingUrl, qrDataUrl) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();   // 210mm
  const height = doc.internal.pageSize.getHeight(); // 297mm

  // Palette Tokens
  const primaryNavy = [15, 23, 42];       // Slate 900
  const brandIndigo = [79, 70, 229];      // Indigo 600
  const brandViolet = [99, 102, 241];     // Indigo 500
  const emeraldAccent = [16, 185, 129];   // Emerald 500
  const surfaceBg = [248, 250, 252];      // Slate 50
  const borderCol = [226, 232, 240];      // Slate 200
  const textDark = [15, 23, 42];          // Slate 900
  const textMuted = [100, 116, 139];      // Slate 500
  const white = [255, 255, 255];

  // 1. Full Page Background
  doc.setFillColor(...surfaceBg);
  doc.rect(0, 0, width, height, 'F');

  // 2. Main Standee Card Outer Frame (with 12mm safe margin)
  const cardX = 12;
  const cardY = 12;
  const cardW = width - 24; // 186mm
  const cardH = height - 24; // 273mm

  // Main Card Background & Shadow Simulation
  doc.setFillColor(...white);
  doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F');
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.8);
  doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'D');

  // 3. Top Banner Header (Navy Band)
  const headerH = 34;
  doc.setFillColor(...primaryNavy);
  // Fill top rectangle and round the top corners
  doc.roundedRect(cardX, cardY, cardW, headerH + 6, 6, 6, 'F');
  doc.rect(cardX, cardY + headerH, cardW, 6, 'F'); // Square off bottom corners

  // Brand Accent Line
  doc.setFillColor(...brandIndigo);
  doc.rect(cardX, cardY + headerH + 5, cardW, 1.5, 'F');

  // Header Title
  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('BookSaathi', width / 2, cardY + 14, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(224, 231, 255); // Indigo 100
  doc.text('VERIFIED RECEPTION APPOINTMENT & QUEUE DESK', width / 2, cardY + 22, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Scan with any Camera, WhatsApp, Paytm, PhonePe or Google Lens', width / 2, cardY + 28, { align: 'center' });

  // 4. Practitioner Profile Identity Block
  const practitionerName = (profile?.name || 'Verified Practitioner').trim();
  const profession = (profile?.profession || 'Specialist Consultant').trim();
  const specialization = profile?.specialization ? ` • ${profile.specialization.trim()}` : '';
  const clinicName = (profile?.businessName || 'Consultation Facility').trim();
  const city = profile?.city ? ` (${profile.city.trim()})` : '';

  let currY = cardY + headerH + 16;

  // Practitioner Name
  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  // Truncate name if excessively long
  const truncatedName = practitionerName.length > 36 ? `${practitionerName.slice(0, 36)}...` : practitionerName;
  doc.text(truncatedName, width / 2, currY, { align: 'center' });

  // Profession & Specialization
  currY += 6.5;
  doc.setTextColor(...brandIndigo);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const profText = `${profession}${specialization}`;
  const truncatedProf = profText.length > 48 ? `${profText.slice(0, 48)}...` : profText;
  doc.text(truncatedProf, width / 2, currY, { align: 'center' });

  // Clinic Facility
  currY += 5.5;
  doc.setTextColor(...textMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const facilityText = `${clinicName}${city}`;
  const truncatedFacility = facilityText.length > 56 ? `${facilityText.slice(0, 56)}...` : facilityText;
  doc.text(truncatedFacility, width / 2, currY, { align: 'center' });

  // Verified Badge Pill
  currY += 5;
  const pillW = 68;
  const pillH = 6;
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.setDrawColor(199, 210, 254); // Indigo 200
  doc.setLineWidth(0.4);
  doc.roundedRect((width - pillW) / 2, currY, pillW, pillH, 3, 3, 'FD');

  doc.setTextColor(...brandIndigo);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DIRECT APPOINTMENTS • 0% EXTRA FEE', width / 2, currY + 4.2, { align: 'center' });

  // 5. Hero QR Code Card (Centered, Perfectly Boxed)
  currY += pillH + 7;
  const qrBoxSize = 82;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = currY;

  // QR Container Background
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.8);
  doc.roundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 4, 4, 'FD');

  // Draw QR Image inside
  if (qrDataUrl) {
    try {
      const qrImgSize = 70;
      const qrImgX = (width - qrImgSize) / 2;
      const qrImgY = qrBoxY + (qrBoxSize - qrImgSize) / 2;
      doc.addImage(qrDataUrl, 'PNG', qrImgX, qrImgY, qrImgSize, qrImgSize);
    } catch (e) {
      console.error('PDF QR insert error:', e);
    }
  }

  // 6. Action Headline & Clean Booking URL
  currY = qrBoxY + qrBoxSize + 8;
  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('SCAN TO BOOK YOUR CONSULTATION', width / 2, currY, { align: 'center' });

  currY += 4.5;
  const urlBoxW = 100;
  const urlBoxH = 7.5;
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect((width - urlBoxW) / 2, currY, urlBoxW, urlBoxH, 3.5, 3.5, 'F');

  doc.setTextColor(...brandIndigo);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  const cleanUrl = bookingUrl.replace(/^https?:\/\//, '');
  const truncatedUrl = cleanUrl.length > 42 ? `${cleanUrl.slice(0, 40)}..` : cleanUrl;
  doc.text(truncatedUrl, width / 2, currY + 5, { align: 'center' });

  // 7. 3-Step Walk-In Instructions Box Grid
  currY += urlBoxH + 8;
  const stepCardW = 54;
  const stepCardH = 21;
  const stepGap = 6;
  const totalStepW = stepCardW * 3 + stepGap * 2;
  const startStepX = (width - totalStepW) / 2;

  const steps = [
    { num: '1', title: 'Scan QR Code', desc: 'Use phone camera or UPI' },
    { num: '2', title: 'Pick Slot / Token', desc: 'Choose consultation time' },
    { num: '3', title: 'Priority Entry', desc: 'Instant WhatsApp pass' },
  ];

  steps.forEach((st, i) => {
    const sx = startStepX + i * (stepCardW + stepGap);
    
    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(sx, currY, stepCardW, stepCardH, 3, 3, 'FD');

    // Number Badge Circle
    doc.setFillColor(...brandIndigo);
    doc.circle(sx + 6.5, currY + 6.5, 3, 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(st.num, sx + 6.5, currY + 7.5, { align: 'center' });

    // Step Title
    doc.setTextColor(...textDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(st.title, sx + 12, currY + 7);

    // Step Description
    doc.setTextColor(...textMuted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(st.desc, sx + 4, currY + 14.5);
  });

  // 8. Bottom Guarantee Band (Attached to Card Base)
  const footerH = 12;
  const footerY = cardY + cardH - footerH;

  doc.setFillColor(...primaryNavy);
  doc.roundedRect(cardX, footerY - 4, cardW, footerH + 4, 6, 6, 'F');
  doc.rect(cardX, footerY - 4, cardW, 4, 'F'); // Square top edge of footer

  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('0% Extra Commission • Direct Practitioner Settlements • Verified by BookSaathi', width / 2, footerY + 4, { align: 'center' });

  // 9. Download the PDF File
  const filename = `reception-standee-${profile?.bookingSlug || 'practice'}.pdf`;
  doc.save(filename);
}
