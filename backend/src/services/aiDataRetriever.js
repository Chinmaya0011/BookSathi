import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Appointment } from '../models/Appointment.js';
import { Availability } from '../models/Availability.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { DailyQueueCounter } from '../models/DailyQueueCounter.js';
import { Grievance } from '../models/Grievance.js';
import { getDateString, toIstParts } from '../utils/dateHelpers.js';

/**
 * Calculate localized dates in Indian Standard Time (Asia/Kolkata)
 */
export function getIndianDateContext() {
  const now = new Date();
  const timezone = 'Asia/Kolkata';

  const todayStr = getDateString(now, timezone);

  // Tomorrow & Yesterday in IST
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = getDateString(tomorrow, timezone);

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = getDateString(yesterday, timezone);

  // Start & End of current month in IST
  const [year, month] = todayStr.split('-').map(Number);
  const startOfMonthStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endOfMonthStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Start of this week (Monday) and end of week (Sunday) in IST
  const istParts = toIstParts(now);
  const dayOfWeek = istParts ? new Date(`${istParts.dateString}T12:00:00+05:30`).getDay() : now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now.getTime() + diffToMonday * 24 * 60 * 60 * 1000);
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  const startOfWeekStr = getDateString(monday, timezone);
  const endOfWeekStr = getDateString(sunday, timezone);

  return {
    todayStr,
    tomorrowStr,
    yesterdayStr,
    startOfMonthStr,
    endOfMonthStr,
    startOfWeekStr,
    endOfWeekStr,
    currentYear: year,
    currentMonthName: new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: timezone }).format(now),
  };
}

/**
 * Deep Question Analysis & Entity Extractor
 */
export function analyzeUserQuestion(text) {
  const raw = (text || '').trim();
  const lower = raw.toLowerCase();

  // 1. Extract Appointment Code (e.g., BK-ROH-01, BK-12345, BS-84920)
  const codeMatch = raw.match(/\b([A-Z0-9]{2,5}-[A-Z0-9]+(-[A-Z0-9]+)?)\b/i);
  const appointmentCode = codeMatch ? codeMatch[1].toUpperCase() : null;

  // 2. Extract Specific ISO Date (YYYY-MM-DD)
  const dateMatch = raw.match(/\b(202[0-9]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))\b/);
  const specificDate = dateMatch ? dateMatch[1] : null;

  // 3. Extract Specific Day of the Week (Monday, Tuesday...)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  let specificDayName = null;
  let targetDayDateStr = null;
  for (let i = 0; i < dayNames.length; i++) {
    if (lower.includes(dayNames[i])) {
      specificDayName = dayNames[i];
      const now = new Date();
      const currentDay = now.getDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7; // Next upcoming occurrence
      const targetDate = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
      targetDayDateStr = getDateString(targetDate, 'Asia/Kolkata');
      break;
    }
  }

  // 4. Extract Doctor/Person Name query (e.g., "Dr. Sen", "Dr. Rajesh", "with Ananya")
  let targetDoctorName = null;
  const docMatch = raw.match(/(?:dr\.?|doctor|with)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (docMatch && docMatch[1] && !['the', 'an', 'my', 'any', 'me', 'in', 'near'].includes(docMatch[1].toLowerCase())) {
    targetDoctorName = docMatch[1].trim();
  }

  // 5. Extract City
  const cities = ['bhubaneswar', 'cuttack', 'delhi', 'mumbai', 'bangalore', 'bengaluru', 'kolkata', 'hyderabad', 'chennai', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'indore', 'patna', 'kochi', 'odisha'];
  const matchedCity = cities.find((c) => lower.includes(c)) || null;

  // 6. Extract Profession
  let matchedProfession = null;
  if (lower.includes('doctor') || lower.includes('daktar') || lower.includes('cardiologist') || lower.includes('dentist') || lower.includes('pediatrician') || lower.includes('dermatologist')) {
    matchedProfession = 'Doctor';
  } else if (lower.includes('ca') || lower.includes('chartered') || lower.includes('accountant') || lower.includes('tax')) {
    matchedProfession = 'CA';
  } else if (lower.includes('lawyer') || lower.includes('advocate') || lower.includes('legal')) {
    matchedProfession = 'Lawyer';
  } else if (lower.includes('therapist') || lower.includes('counselor') || lower.includes('psychologist')) {
    matchedProfession = 'Therapist';
  } else if (lower.includes('trainer') || lower.includes('coach') || lower.includes('fitness')) {
    matchedProfession = 'Trainer';
  }

  return {
    raw,
    lower,
    appointmentCode,
    specificDate,
    specificDayName,
    targetDayDateStr,
    targetDoctorName,
    matchedCity,
    matchedProfession,
  };
}

// Multilingual Matchers
function hasTomorrowKeyword(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('tomorrow') || lower.includes('kal') || lower.includes('kaali') || lower.includes('kalke') || lower.includes('kalko') || lower.includes('repu') || lower.includes('naalai') || lower.includes('udya') || lower.includes('कल') || lower.includes('কাली') || lower.includes('কালকে');
}

function hasTodayKeyword(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('today') || lower.includes('aaj') || lower.includes('aaji') || lower.includes('aajke') || lower.includes('ee roju') || lower.includes('inru') || lower.includes('aajche') || lower.includes('आज') || lower.includes('आजी') || lower.includes('आजके');
}

function hasNextKeyword(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('next') || lower.includes('agla') || lower.includes('agli') || lower.includes('agle') || lower.includes('porer') || lower.includes('pehle') || lower.includes('upcoming') || lower.includes('closest') || lower.includes('पहला') || lower.includes('अगला');
}

function hasCountKeyword(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('how many') || lower.includes('count') || lower.includes('number of') || lower.includes('kitne') || lower.includes('kitna') || lower.includes('kitni') || lower.includes('kete') || lower.includes('koto') || lower.includes('total') || lower.includes('summary') || lower.includes('संख्या') || lower.includes('कितने');
}

function hasQueueKeyword(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('queue') || lower.includes('token') || lower.includes('line') || lower.includes('serving') || lower.includes('waiting') || lower.includes('katar') || lower.includes('katai') || lower.includes('bari') || lower.includes('बारी') || lower.includes('टोकन') || lower.includes('लाइन');
}

function hasCancelKeyword(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('cancel') || lower.includes('reject') || lower.includes('radd') || lower.includes('hatao') || lower.includes('bad') || lower.includes('रद्द');
}

function hasAvailabilityKeyword(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('availability') || lower.includes('shift') || lower.includes('timing') || lower.includes('working hour') || lower.includes('working days') || lower.includes('slot') || lower.includes('samay') || lower.includes('kab khula') || lower.includes('समय') || lower.includes('टाइम');
}

function hasServiceKeyword(text) {
  const lower = (text || '').toLowerCase();
  return lower.includes('service') || lower.includes('tariff') || lower.includes('fee') || lower.includes('price') || lower.includes('charge') || lower.includes('cost') || lower.includes('karcha') || lower.includes('paisa') || lower.includes('फीस') || lower.includes('खर्च');
}

function isPublicDirectorySearch(text) {
  const lower = (text || '').toLowerCase();
  const professionKeywords = ['doctor', 'doctors', 'daktar', 'ca', 'chartered accountant', 'lawyer', 'lawyers', 'advocate', 'therapist', 'trainer', 'consultant', 'cardiologist', 'dentist', 'dermatologist', 'pediatrician', 'physiotherapist', 'dietitian', 'specialist', 'specialists', 'practitioner', 'clinic', 'clinics', 'hospital', 'डॉक्टर', 'डाक्टर', 'वकील'];
  const cityKeywords = ['bhubaneswar', 'cuttack', 'delhi', 'mumbai', 'bangalore', 'bengaluru', 'kolkata', 'hyderabad', 'chennai', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'indore', 'patna', 'kochi', 'odisha'];
  const searchActionKeywords = ['find', 'search', 'look for', 'looking for', 'near', 'show', 'list', 'recommend', 'available', 'explore', 'discover', 'dhundo', 'dhundho', 'khojo', 'khoj', 'dekho', 'dekhna', 'who are', 'ढूंढो', 'खोजो', 'दिखाओ'];

  const hasProfession = professionKeywords.some((k) => lower.includes(k));
  const hasCity = cityKeywords.some((c) => lower.includes(c));
  const hasSearchAction = searchActionKeywords.some((a) => lower.includes(a));

  if (hasProfession && (hasCity || hasSearchAction)) return true;
  if (hasSearchAction && (hasProfession || hasCity)) return true;
  if ((lower.startsWith('doctor') || lower.startsWith('ca ') || lower.startsWith('lawyer') || lower.startsWith('specialist')) && (hasCity || lower.includes('in '))) return true;

  return false;
}

/**
 * Detect query intent from natural language message
 */
export function detectQueryIntent(text, role) {
  const lower = (text || '').toLowerCase().trim();

  // 1. Security guard
  if (
    lower.includes('ignore previous instructions') ||
    lower.includes('ignore all rules') ||
    lower.includes('system prompt') ||
    lower.includes('bypass security') ||
    lower.includes('dump database') ||
    lower.includes('reveal secret')
  ) {
    return { type: 'PROMPT_INJECTION_ATTEMPT', isUnauthorized: true };
  }

  // 2. Greetings
  if (isGeneralGreeting(lower)) {
    return { type: 'GENERAL_GREETING', isGreeting: true };
  }

  // 3. Public Directory Search
  if (isPublicDirectorySearch(lower)) {
    return { type: 'DIRECTORY_SEARCH' };
  }

  // 4. Role: USER / PATIENT
  if (role === 'USER') {
    if (
      lower.includes('all users') ||
      lower.includes('total platform revenue') ||
      lower.includes('patient record of other') ||
      lower.includes('all patient') ||
      lower.includes('other patient') ||
      lower.includes('all booking across') ||
      lower.includes('platform metric') ||
      lower.includes('system setting') ||
      lower.includes('admin stat') ||
      lower.includes('system stat') ||
      lower.includes('database dump')
    ) {
      return { type: 'UNAUTHORIZED_ACCESS', isUnauthorized: true };
    }
    if (lower.includes('reschedule') || lower.includes('change date') || lower.includes('change time')) {
      return { type: 'PLATFORM_KNOWLEDGE', topic: 'RESCHEDULING', isPlatformKnowledge: true };
    }
    if (hasCountKeyword(lower) && (lower.includes('appointment') || lower.includes('booking') || lower.includes('consultation') || lower.includes('month') || lower.includes('week') || lower.includes('today') || lower.includes('tomorrow'))) {
      return { type: 'USER_COUNT_STATS' };
    }
    if (hasTomorrowKeyword(lower)) {
      return { type: 'USER_TOMORROW_APPOINTMENTS' };
    }
    if (hasTodayKeyword(lower)) {
      return { type: 'USER_TODAY_APPOINTMENTS' };
    }
    if (hasNextKeyword(lower) || lower.includes('who is my next') || lower.includes('who is my doctor') || lower.includes('next doctor') || lower.includes('agla')) {
      return { type: 'USER_NEXT_APPOINTMENT' };
    }
    if (hasCancelKeyword(lower)) {
      return { type: 'USER_CANCELLED_APPOINTMENTS' };
    }
    if (lower.includes('past') || lower.includes('history') || lower.includes('previous') || lower.includes('completed') || lower.includes('purana')) {
      return { type: 'USER_PAST_APPOINTMENTS' };
    }
    if (lower.includes('profile') || lower.includes('my name') || lower.includes('my email') || lower.includes('my phone') || lower.includes('mera naam')) {
      return { type: 'USER_PROFILE' };
    }
    if (lower.includes('appointment') || lower.includes('booking') || lower.includes('schedule') || lower.includes('consultation') || lower.includes('token') || lower.includes('dikhana') || lower.includes('doctor')) {
      return { type: 'USER_UPCOMING_APPOINTMENTS' };
    }
  }

  // 5. Role: PROFESSIONAL
  if (role === 'PROFESSIONAL') {
    if (lower.includes('other doctor') || lower.includes('other professional') || lower.includes('total platform revenue') || lower.includes('system setting') || lower.includes('admin stats')) {
      return { type: 'UNAUTHORIZED_ACCESS', isUnauthorized: true };
    }
    if (hasQueueKeyword(lower)) {
      return { type: 'PRO_QUEUE_STATUS' };
    }
    if (hasCountKeyword(lower)) {
      return { type: 'PRO_STATS_COUNT' };
    }
    if (hasTodayKeyword(lower)) {
      return { type: 'PRO_TODAY_SCHEDULE' };
    }
    if (hasTomorrowKeyword(lower)) {
      return { type: 'PRO_TOMORROW_SCHEDULE' };
    }
    if (hasNextKeyword(lower) || lower.includes('next patient') || lower.includes('agla patient') || lower.includes('agla mareez')) {
      return { type: 'PRO_NEXT_PATIENT' };
    }
    if (hasAvailabilityKeyword(lower)) {
      return { type: 'PRO_AVAILABILITY' };
    }
    if (hasServiceKeyword(lower)) {
      return { type: 'PRO_SERVICES' };
    }
    if (lower.includes('profile') || lower.includes('slug') || lower.includes('link') || lower.includes('clinic')) {
      return { type: 'PRO_PROFILE' };
    }
    if (lower.includes('appointment') || lower.includes('booking') || lower.includes('schedule') || lower.includes('consultation') || lower.includes('patient') || lower.includes('client')) {
      return { type: 'PRO_UPCOMING_SCHEDULE' };
    }
  }

  // 6. Role: ADMIN
  if (role === 'ADMIN') {
    if (lower.includes('stat') || lower.includes('metric') || lower.includes('overview') || hasCountKeyword(lower) || lower.includes('revenue') || lower.includes('user') || lower.includes('booking') || lower.includes('grievance') || lower.includes('activity')) {
      return { type: 'ADMIN_METRICS' };
    }
  }

  // 7. Platform knowledge / How-to guides
  const faqTopic = detectPlatformKnowledgeTopic(lower);
  if (faqTopic) {
    return { type: 'PLATFORM_KNOWLEDGE', topic: faqTopic, isPlatformKnowledge: true };
  }

  // 8. GUEST attempting private personal appointment actions
  if (role === 'GUEST') {
    if (
      lower.includes('show my appointment') ||
      lower.includes('my appointment list') ||
      lower.includes('what are my bookings') ||
      lower.includes('my upcoming appointment') ||
      lower.includes('mera appointment dikhao') ||
      lower.includes('my queue token')
    ) {
      return { type: 'GUEST_AUTH_REQUIRED', requiresAuth: true };
    }
  }

  return { type: 'GENERAL_QUERY' };
}

function detectPlatformKnowledgeTopic(lower) {
  if (
    !hasCountKeyword(lower) &&
    (
      lower.includes('how to book') ||
      lower.includes('how do i book') ||
      lower.includes('how can i book') ||
      lower.includes('booking process') ||
      lower.includes('how does booking work') ||
      lower.includes('kaise book kare') ||
      lower.includes('steps to book')
    )
  ) {
    return 'BOOKING_GUIDE';
  }

  if (
    lower.includes('refund') ||
    lower.includes('cancellation policy') ||
    lower.includes('cancel policy') ||
    lower.includes('how to cancel') ||
    lower.includes('money back') ||
    lower.includes('paisa wapas')
  ) {
    return 'REFUND_CANCELLATION';
  }

  if (
    lower.includes('reschedule') ||
    lower.includes('change date') ||
    lower.includes('change time') ||
    lower.includes('postpone') ||
    lower.includes('samay badalna')
  ) {
    return 'RESCHEDULING';
  }

  if (
    (lower.includes('queue') || lower.includes('token')) &&
    (lower.includes('how') || lower.includes('work') || lower.includes('system') || lower.includes('what is') || lower.includes('kaise'))
  ) {
    return 'QUEUE_SYSTEM';
  }

  if (
    lower.includes('qr code') ||
    lower.includes('standee') ||
    lower.includes('reception qr') ||
    lower.includes('banner') ||
    lower.includes('print qr')
  ) {
    return 'QR_BANNER';
  }

  if (
    (lower.includes('payment') || lower.includes('upi') || lower.includes('razorpay') || lower.includes('stripe')) &&
    (lower.includes('method') || lower.includes('supported') || lower.includes('accept') || lower.includes('how') || lower.includes('option'))
  ) {
    return 'PAYMENTS';
  }

  if (
    (lower.includes('availability') || lower.includes('working hour') || lower.includes('shifts') || lower.includes('set timing')) &&
    (lower.includes('how to configure') || lower.includes('how to set') || lower.includes('how do i set') || lower.includes('how can i configure'))
  ) {
    return 'AVAILABILITY_GUIDE';
  }

  if (
    lower.includes('grievance') ||
    lower.includes('complaint') ||
    lower.includes('support desk') ||
    lower.includes('file a complaint') ||
    lower.includes('contact support')
  ) {
    return 'GRIEVANCE_SUPPORT';
  }

  return null;
}

function getPlatformKnowledgeContent(topic, role) {
  switch (topic) {
    case 'BOOKING_GUIDE':
      return {
        title: 'How Appointment Booking Works on BookSaathi',
        content: `1. **Find Professional**: Visit the professional's direct URL (e.g. \`booksaathi.in/dr-ananya-sen\`) or search the directory.\n2. **Select Service & Mode**: Choose the consultation type (In-Clinic or Online Video) and fee.\n3. **Pick Date & Time**: Choose an open slot or join the live token queue.\n4. **Instant Confirmation**: Enter name and contact details. An instant appointment code (e.g. \`BK-12345\`) and secure management link are generated without mandatory app downloads.`,
        action: { label: 'Explore Directory', action: 'BOOK_APPOINTMENT', href: '/dashboard/find' },
      };
    case 'REFUND_CANCELLATION':
      return {
        title: 'BookSaathi Cancellation & Refund Policy',
        content: `• **Free Cancellation Window**: Clients can cancel up to 2 hours prior to the scheduled consultation time via their self-service booking link or dashboard.\n• **Automated Refunds**: For prepaid appointments via Razorpay or UPI, refund requests are processed back to the original payment source within 3-5 business days.\n• **Practitioner Cancellations**: If a professional cancels or reschedules, a 100% full refund is automatically initiated with SMS/Email notifications.`,
        action: { label: 'View Appointments', action: 'VIEW_APPOINTMENTS', href: '/dashboard/appointments' },
      };
    case 'RESCHEDULING':
      return {
        title: 'Rescheduling an Appointment on BookSaathi',
        content: `• **Patient / Client Rescheduling**: To reschedule your appointment, open your booking from the dashboard or confirmation SMS/email link, select **Reschedule**, and choose a new available time slot.\n• **Professional Rescheduling**: Practitioners can also propose or update consultation times directly from their schedule dashboard.`,
        action: { label: 'Manage Appointments', action: 'VIEW_APPOINTMENTS', href: '/dashboard/appointments' },
      };
    case 'QUEUE_SYSTEM':
      return {
        title: 'Live Token Queue Management',
        content: `• **Dynamic Token Issuance**: Walk-in and scheduled patients are assigned sequential daily tokens.\n• **Live Real-Time Status**: Patients can track current serving tokens and estimated wait times on their phones.\n• **One-Click Call Next**: Professionals and clinic staff can advance the queue with **Call Next Token** directly from their practice dashboard.`,
        action: { label: 'View Queue', action: 'VIEW_QUEUE', href: '/dashboard/appointments' },
      };
    case 'QR_BANNER':
      return {
        title: 'Clinic & Office Reception QR Standees',
        content: `• **Instant Standee Generator**: Professionals can generate branded high-resolution QR banners from **Dashboard > QR Banner**.\n• **Zero-Touch Patient Check-In**: Walk-in patients scan the standee with any smartphone camera or Google Lens to instantly book or take a queue token.`,
        action: { label: 'Generate QR Banner', action: 'VIEW_PROFILE', href: '/dashboard/qr-banner' },
      };
    case 'PAYMENTS':
      return {
        title: 'Integrated Indian & Global Payments',
        content: `• **Payment Methods**: Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking (Razorpay), Stripe, and In-Clinic Cash.\n• **Settlement**: Consultation fees are securely tracked and settled according to practice preferences.`,
        action: { label: 'Billing Settings', action: 'VIEW_SERVICES', href: '/dashboard/services' },
      };
    case 'AVAILABILITY_GUIDE':
      return {
        title: 'Configuring Weekly Availability & Shifts',
        content: `• **Weekly Shifts**: Define operating hours for each day of the week under **Dashboard > Availability**.\n• **Buffer Times**: Set consultation durations, break intervals, and daily booking limits to avoid overbooking.\n• **Holiday / Date Blocking**: Block specific dates for holidays or emergencies with automated slot suppression.`,
        action: { label: 'Configure Availability', action: 'MANAGE_AVAILABILITY', href: '/dashboard/availability' },
      };
    case 'GRIEVANCE_SUPPORT':
      return {
        title: 'Support & Grievance Redressal',
        content: `• **Official Helpdesk**: Contact BookSaathi support anytime via **Dashboard > Support** or file a grievance.\n• **Resolution SLA**: All platform tickets are investigated by the BookSaathi compliance team within 24 business hours.`,
        action: { label: 'Contact Support', action: 'VIEW_MESSAGES', href: '/dashboard/messages' },
      };
    default:
      return null;
  }
}

/**
 * Intelligent Multi-Strategy Database Retriever
 * Analyzes question -> Finds exact data from DB -> Assembles rich facts
 */
export const retrieveDatabaseDataForQuery = async ({
  user = null,
  profile = null,
  role = 'GUEST',
  message = '',
}) => {
  const text = (message || '').trim();
  const dateCtx = getIndianDateContext();
  const analysis = analyzeUserQuestion(text);
  const intent = detectQueryIntent(text, role);

  // 1. Security & Prompt Injection
  if (intent.isUnauthorized) {
    return {
      contextText: 'UNAUTHORIZED_REQUEST: You do not have permission to access global system statistics or other users’ private information.',
      hasData: true,
      isUnauthorized: true,
      intent: intent.type,
      structuredData: null,
    };
  }

  if (intent.requiresAuth) {
    return {
      contextText: 'AUTHENTICATION_REQUIRED: Please log in to your BookSaathi account to access your personal appointments and schedule.',
      hasData: true,
      requiresAuth: true,
      intent: intent.type,
      structuredData: null,
    };
  }

  // 2. Platform Knowledge
  if (intent.isPlatformKnowledge) {
    const kb = getPlatformKnowledgeContent(intent.topic, role);
    if (kb) {
      return {
        contextText: `BookSaathi Official Knowledge: ${kb.title}\n${kb.content}`,
        hasData: true,
        isGeneral: false,
        intent: intent.type,
        structuredData: {
          type: 'text',
          title: kb.title,
          content: kb.content,
        },
        quickActions: kb.action ? [kb.action] : [],
      };
    }
  }

  // 3. Greetings
  if (intent.isGreeting) {
    return {
      contextText: 'GREETING: User greeted the assistant.',
      hasData: true,
      isGeneral: true,
      intent: intent.type,
      structuredData: null,
    };
  }

  let contextParts = [];
  let structuredData = null;

  // ==========================================
  // SPECIFIC APPOINTMENT CODE LOOKUP (ANY ROLE)
  // ==========================================
  if (analysis.appointmentCode) {
    let aptQuery = { appointmentCode: analysis.appointmentCode };
    if (role === 'USER' && user) {
      const userOr = [{ userId: user._id }];
      if (user.email) userOr.push({ customerEmail: { $regex: new RegExp(`^${user.email.trim()}$`, 'i') } });
      aptQuery.$or = userOr;
    } else if (role === 'PROFESSIONAL' && user) {
      const proProf = profile || (await ProfessionalProfile.findOne({ userId: user._id }).lean());
      if (proProf) aptQuery.professionalId = proProf._id;
    }

    const matchedApt = await Appointment.findOne(aptQuery)
      .populate('professionalId', 'name profession specialization city consultationFee bookingSlug')
      .lean();

    if (matchedApt) {
      const pro = matchedApt.professionalId || {};
      structuredData = {
        type: 'appointment',
        title: `Appointment Details for ${matchedApt.appointmentCode}`,
        item: {
          appointmentCode: matchedApt.appointmentCode,
          date: matchedApt.dateString,
          time: matchedApt.startTime || (matchedApt.queueNumber ? `Token #${matchedApt.queueNumber}` : 'Scheduled'),
          professional: pro.name || 'Specialist',
          profession: pro.profession || 'Doctor',
          specialization: pro.specialization || '',
          service: matchedApt.appointmentTypeName || 'Consultation',
          status: matchedApt.status,
          token: matchedApt.queueNumber ? String(matchedApt.queueNumber) : null,
          fee: `₹${matchedApt.fee || pro.consultationFee || 0}`,
          bookingType: matchedApt.bookingType || 'TIME_SLOT',
        },
      };

      contextParts.push(`\nVerified Database Record for Appointment Code [${matchedApt.appointmentCode}]:`);
      contextParts.push(
        `- Code: ${matchedApt.appointmentCode}\n- Date: ${matchedApt.dateString}\n- Time: ${matchedApt.startTime || 'Token #' + matchedApt.queueNumber}\n- Status: ${matchedApt.status}\n- Practitioner: ${pro.name || 'Specialist'} (${pro.profession || 'Doctor'}, ${pro.specialization || ''})\n- Patient Name: ${matchedApt.customerName}\n- Service: ${matchedApt.appointmentTypeName}\n- Fee: ₹${matchedApt.fee || 0}`
      );
    }
  }

  // ==========================================
  // 1. PUBLIC / DIRECTORY DATA SEARCH
  // ==========================================
  if (!structuredData && (intent.type === 'DIRECTORY_SEARCH' || analysis.matchedProfession || analysis.matchedCity)) {
    const searchFilter = { isPublic: true, status: 'ACTIVE' };

    if (analysis.matchedProfession) searchFilter.profession = analysis.matchedProfession;
    if (analysis.matchedCity) searchFilter.city = { $regex: new RegExp(analysis.matchedCity, 'i') };
    if (analysis.targetDoctorName) searchFilter.name = { $regex: new RegExp(analysis.targetDoctorName, 'i') };

    let directoryMatches = await ProfessionalProfile.find(searchFilter)
      .select('name profession specialization city consultationFee bookingSlug rating totalReviews experienceYears isVerified')
      .limit(4)
      .lean();

    if ((!directoryMatches || directoryMatches.length === 0) && (searchFilter.city || searchFilter.name)) {
      const broadFilter = { isPublic: true, status: 'ACTIVE' };
      if (searchFilter.profession) broadFilter.profession = searchFilter.profession;
      directoryMatches = await ProfessionalProfile.find(broadFilter)
        .select('name profession specialization city consultationFee bookingSlug rating totalReviews experienceYears isVerified')
        .limit(4)
        .lean();
    }

    if (directoryMatches && directoryMatches.length > 0) {
      structuredData = {
        type: 'professionals',
        title: `Verified Professionals Directory Results`,
        items: directoryMatches.map((d) => ({
          name: d.name,
          profession: d.profession,
          specialization: d.specialization || 'General Specialist',
          city: d.city || 'India',
          fee: `₹${d.consultationFee || 0}`,
          rating: d.rating ? String(d.rating) : '4.8',
          bookingSlug: d.bookingSlug,
          experience: d.experienceYears ? `${d.experienceYears}+ yrs exp` : 'Verified Expert',
        })),
      };

      contextParts.push(`\nPublic Verified Professionals Directory Sample:`);
      directoryMatches.forEach((d) => {
        contextParts.push(
          `- ${d.name} (${d.profession} - ${d.specialization || 'Consultant'}) in ${d.city || 'India'} | Fee: ₹${d.consultationFee || 0} | Rating: ${d.rating || '4.8'} ⭐ | Booking Link: /${d.bookingSlug}`
        );
      });
    } else {
      contextParts.push(`\nPublic Directory Search: No active verified professionals found matching criteria "${text}".`);
    }
  }

  // ==========================================
  // 2. USER / CUSTOMER DATA RETRIEVAL
  // ==========================================
  if (!structuredData && role === 'USER' && user) {
    const userOr = [];
    if (user._id && mongoose.isValidObjectId(user._id)) {
      userOr.push({ userId: user._id });
    }
    if (user.email) userOr.push({ customerEmail: { $regex: new RegExp(`^${user.email.trim()}$`, 'i') } });
    if (user.phone) {
      const cleanPhone = user.phone.replace(/\D/g, '');
      const last10 = cleanPhone.slice(-10);
      if (last10.length === 10) {
        userOr.push({ customerPhone: { $regex: new RegExp(`${last10}$`) } });
      } else {
        userOr.push({ customerPhone: user.phone });
      }
    }
    const baseUserFilter = userOr.length > 0 ? { $or: userOr } : { _id: null };

    // Numerical / count queries
    if (intent.type === 'USER_COUNT_STATS') {
      let filter = { ...baseUserFilter };
      let timeLabel = `this month (${dateCtx.currentMonthName} ${dateCtx.currentYear})`;

      const lower = text.toLowerCase();
      if (hasTomorrowKeyword(lower)) {
        filter.dateString = dateCtx.tomorrowStr;
        timeLabel = `tomorrow (${dateCtx.tomorrowStr})`;
      } else if (hasTodayKeyword(lower)) {
        filter.dateString = dateCtx.todayStr;
        timeLabel = `today (${dateCtx.todayStr})`;
      } else if (lower.includes('this week') || lower.includes('week') || lower.includes('hafte') || lower.includes('saptah')) {
        filter.dateString = { $gte: dateCtx.startOfWeekStr, $lte: dateCtx.endOfWeekStr };
        timeLabel = `this week (${dateCtx.startOfWeekStr} to ${dateCtx.endOfWeekStr})`;
      } else {
        filter.dateString = { $gte: dateCtx.startOfMonthStr, $lte: dateCtx.endOfMonthStr };
      }

      const [totalCount, completedCount, cancelledCount, upcomingCount] = await Promise.all([
        Appointment.countDocuments(filter),
        Appointment.countDocuments({ ...filter, status: { $in: ['COMPLETED', 'DONE'] } }),
        Appointment.countDocuments({ ...filter, status: { $in: ['CANCELLED', 'REJECTED'] } }),
        Appointment.countDocuments({ ...filter, status: { $in: ['CONFIRMED', 'BOOKED', 'PENDING', 'WAITING', 'ARRIVED', 'IN_PROGRESS', 'RESCHEDULED', 'RESCHEDULE_REQUESTED'] } }),
      ]);

      const statsItems = [
        { label: 'Total Bookings', value: totalCount },
        { label: 'Upcoming', value: upcomingCount },
        { label: 'Completed', value: completedCount },
        { label: 'Cancelled', value: cancelledCount },
      ];

      structuredData = {
        type: 'statistics',
        title: `Appointment Statistics (${timeLabel})`,
        stats: statsItems,
        data: {
          stats: statsItems,
        },
      };

      contextParts.push(
        `User Appointment Statistics for ${timeLabel}:\n- Total Bookings: ${totalCount} matching appointment(s)\n- Upcoming: ${upcomingCount}\n- Completed: ${completedCount}\n- Cancelled: ${cancelledCount}`
      );
    }

    // Specific list queries (Tomorrow, Today, Next, Specific Date, Specific Day, Cancelled, History, Upcoming)
    let appointmentQuery = { ...baseUserFilter };
    let limit = 5;
    let queryTitle = "Upcoming Appointments";

    if (analysis.specificDate) {
      appointmentQuery.dateString = analysis.specificDate;
      queryTitle = `Appointments for ${analysis.specificDate}`;
    } else if (analysis.targetDayDateStr) {
      appointmentQuery.dateString = analysis.targetDayDateStr;
      queryTitle = `${analysis.specificDayName.charAt(0).toUpperCase() + analysis.specificDayName.slice(1)}'s Appointments (${analysis.targetDayDateStr})`;
    } else if (intent.type === 'USER_TOMORROW_APPOINTMENTS') {
      appointmentQuery.dateString = dateCtx.tomorrowStr;
      appointmentQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] };
      queryTitle = `Tomorrow's Appointments (${dateCtx.tomorrowStr})`;
    } else if (intent.type === 'USER_TODAY_APPOINTMENTS') {
      appointmentQuery.dateString = dateCtx.todayStr;
      appointmentQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] };
      queryTitle = `Today's Appointments (${dateCtx.todayStr})`;
    } else if (intent.type === 'USER_NEXT_APPOINTMENT') {
      appointmentQuery.dateString = { $gte: dateCtx.todayStr };
      appointmentQuery.status = { $in: ['CONFIRMED', 'BOOKED', 'PENDING', 'WAITING', 'ARRIVED', 'IN_PROGRESS', 'RESCHEDULED', 'RESCHEDULE_REQUESTED'] };
      queryTitle = "Next Upcoming Appointment";
      limit = 1;
    } else if (intent.type === 'USER_CANCELLED_APPOINTMENTS') {
      appointmentQuery.status = { $in: ['CANCELLED', 'REJECTED'] };
      queryTitle = "Cancelled Appointments";
    } else if (intent.type === 'USER_PAST_APPOINTMENTS') {
      appointmentQuery.dateString = { $lt: dateCtx.todayStr };
      queryTitle = "Past Appointments History";
    } else if (intent.type === 'USER_UPCOMING_APPOINTMENTS') {
      appointmentQuery.dateString = { $gte: dateCtx.todayStr };
      appointmentQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED', 'COMPLETED', 'DONE'] };
      queryTitle = "Upcoming Appointments";
    }

    if (intent.type !== 'USER_COUNT_STATS' && intent.type !== 'USER_PROFILE') {
      const appointments = await Appointment.find(appointmentQuery)
        .select('appointmentCode dateString startTime endTime bookingType queueNumber status fee customerName appointmentTypeName rescheduleRequest')
        .populate('professionalId', 'name profession specialization city consultationFee bookingSlug')
        .sort({ dateString: 1, startTime: 1 })
        .limit(limit)
        .lean();

      if (appointments && appointments.length > 0) {
        structuredData = {
          type: 'appointments',
          title: queryTitle,
          items: appointments.map((apt) => {
            const pro = apt.professionalId || {};
            return {
              appointmentCode: apt.appointmentCode,
              date: apt.dateString,
              time: apt.startTime || (apt.queueNumber ? `Token #${apt.queueNumber}` : 'Scheduled'),
              professional: pro.name || 'Specialist',
              profession: pro.profession || 'Doctor',
              specialization: pro.specialization || '',
              service: apt.appointmentTypeName || 'Consultation',
              status: apt.status,
              token: apt.queueNumber ? String(apt.queueNumber) : null,
              fee: `₹${apt.fee || pro.consultationFee || 0}`,
              bookingType: apt.bookingType || 'TIME_SLOT',
              bookingSlug: pro.bookingSlug || '',
            };
          }),
        };

        contextParts.push(`\nAuthenticated User Appointments (${queryTitle} - ${appointments.length} record(s)):`);
        appointments.forEach((apt, idx) => {
          const pro = apt.professionalId || {};
          contextParts.push(
            `${idx + 1}. Code: ${apt.appointmentCode} | Date: ${apt.dateString} | Time: ${apt.startTime || 'Token #' + apt.queueNumber} | Status: ${apt.status} | Professional: ${pro.name || 'Specialist'} (${pro.profession || 'Doctor'}, ${pro.specialization || ''}) | Service: ${apt.appointmentTypeName || 'Consultation'} | Fee: ₹${apt.fee || pro.consultationFee || 0}`
          );
        });
      } else {
        contextParts.push(`\nAuthenticated User Appointments: No appointments found for ${queryTitle} in user account.`);
      }
    }

    // User Profile
    if (intent.type === 'USER_PROFILE') {
      contextParts.push(
        `\nUser Profile: Name: "${user.name || 'Not specified'}", Email: "${user.email}", Phone: "${user.phone || 'Not specified'}", Role: "${user.role}"`
      );
    }
  }

  // ==========================================
  // 3. PROFESSIONAL DATA RETRIEVAL
  // ==========================================
  if (!structuredData && role === 'PROFESSIONAL' && user) {
    let proProfile = profile;
    if (!proProfile) {
      proProfile = await ProfessionalProfile.findOne({ userId: user._id })
        .select('name profession specialization city consultationFee bookingSlug status plan')
        .lean();
    }

    if (proProfile) {
      const proId = proProfile._id;

      // Queue Status Query
      if (intent.type === 'PRO_QUEUE_STATUS') {
        const [queueCounter, waitingList] = await Promise.all([
          DailyQueueCounter.findOne({ professionalId: proId, dateString: dateCtx.todayStr }).lean(),
          Appointment.find({
            professionalId: proId,
            dateString: dateCtx.todayStr,
            status: { $in: ['BOOKED', 'CONFIRMED', 'WAITING', 'ARRIVED', 'CALLED'] },
          })
            .select('appointmentCode customerName queueNumber status startTime appointmentTypeName')
            .sort({ queueNumber: 1, startTime: 1 })
            .limit(5)
            .lean(),
        ]);

        const currentServing = queueCounter?.currentServingNumber || 0;
        const totalIssued = queueCounter?.lastQueueNumber || waitingList.length;
        const waitingCount = waitingList.length;
        const nextToken = currentServing + 1 <= totalIssued ? currentServing + 1 : (waitingList[0]?.queueNumber || null);

        structuredData = {
          type: 'queue',
          title: `Today's Queue Status (${dateCtx.todayStr})`,
          currentServingToken: currentServing > 0 ? String(currentServing) : 'Not Started',
          totalTokensIssued: totalIssued,
          waitingCount,
          nextToken: nextToken ? String(nextToken) : 'None',
          waitingPatients: waitingList.map((w) => ({
            name: w.customerName,
            token: w.queueNumber ? String(w.queueNumber) : 'Walk-in',
            status: w.status,
            service: w.appointmentTypeName,
          })),
        };

        contextParts.push(
          `Today's Live Queue (${dateCtx.todayStr}): Currently Serving Token: #${currentServing || 'None'}, Total Issued: ${totalIssued}, Patients Waiting: ${waitingCount}, Next Token: #${nextToken || 'None'}`
        );
      }

      // Statistics & Counts
      else if (intent.type === 'PRO_STATS_COUNT') {
        const lower = text.toLowerCase();
        let timeLabel = `This Month (${dateCtx.currentMonthName} ${dateCtx.currentYear})`;
        let filter = { professionalId: proId };

        if (hasTodayKeyword(lower)) {
          filter.dateString = dateCtx.todayStr;
          timeLabel = `Today (${dateCtx.todayStr})`;
        } else if (hasTomorrowKeyword(lower)) {
          filter.dateString = dateCtx.tomorrowStr;
          timeLabel = `Tomorrow (${dateCtx.tomorrowStr})`;
        } else if (lower.includes('week') || lower.includes('this week') || lower.includes('hafte') || lower.includes('saptah')) {
          filter.dateString = { $gte: dateCtx.startOfWeekStr, $lte: dateCtx.endOfWeekStr };
          timeLabel = `This Week (${dateCtx.startOfWeekStr} to ${dateCtx.endOfWeekStr})`;
        } else {
          filter.dateString = { $gte: dateCtx.startOfMonthStr, $lte: dateCtx.endOfMonthStr };
        }

        const [totalBookings, completed, pending, cancelled] = await Promise.all([
          Appointment.countDocuments(filter),
          Appointment.countDocuments({ ...filter, status: { $in: ['DONE', 'COMPLETED'] } }),
          Appointment.countDocuments({ ...filter, status: { $in: ['BOOKED', 'CONFIRMED', 'WAITING', 'ARRIVED', 'CALLED', 'IN_PROGRESS', 'PENDING'] } }),
          Appointment.countDocuments({ ...filter, status: { $in: ['CANCELLED', 'REJECTED'] } }),
        ]);

        const statsItems = [
          { label: 'Total Bookings', value: totalBookings },
          { label: 'Completed', value: completed },
          { label: 'Active / Pending', value: pending },
          { label: 'Cancelled', value: cancelled },
        ];

        structuredData = {
          type: 'statistics',
          title: `Practice Metrics (${timeLabel})`,
          stats: statsItems,
          data: {
            stats: statsItems,
          },
        };

        contextParts.push(
          `Practice Metrics for ${timeLabel} (Today's Bookings Count: ${totalBookings}):\n- Total Bookings: ${totalBookings}\n- Completed: ${completed}\n- Active / Pending: ${pending}\n- Cancelled: ${cancelled}`
        );
      }

      // Schedule & Appointments
      else if (
        intent.type === 'PRO_TODAY_SCHEDULE' ||
        intent.type === 'PRO_TOMORROW_SCHEDULE' ||
        intent.type === 'PRO_NEXT_PATIENT' ||
        intent.type === 'PRO_UPCOMING_SCHEDULE' ||
        analysis.specificDate ||
        analysis.targetDayDateStr
      ) {
        let proAptQuery = { professionalId: proId };
        let proLimit = 6;
        let queryTitle = "Upcoming Consultations";

        if (analysis.specificDate) {
          proAptQuery.dateString = analysis.specificDate;
          queryTitle = `Consultations for ${analysis.specificDate}`;
        } else if (analysis.targetDayDateStr) {
          proAptQuery.dateString = analysis.targetDayDateStr;
          queryTitle = `${analysis.specificDayName.charAt(0).toUpperCase() + analysis.specificDayName.slice(1)}'s Consultations (${analysis.targetDayDateStr})`;
        } else if (intent.type === 'PRO_TODAY_SCHEDULE') {
          proAptQuery.dateString = dateCtx.todayStr;
          proAptQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] };
          queryTitle = `Today's Consultations (${dateCtx.todayStr})`;
        } else if (intent.type === 'PRO_TOMORROW_SCHEDULE') {
          proAptQuery.dateString = dateCtx.tomorrowStr;
          proAptQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] };
          queryTitle = `Tomorrow's Consultations (${dateCtx.tomorrowStr})`;
        } else if (intent.type === 'PRO_NEXT_PATIENT') {
          proAptQuery.dateString = { $gte: dateCtx.todayStr };
          proAptQuery.status = { $in: ['BOOKED', 'CONFIRMED', 'WAITING', 'ARRIVED', 'CALLED', 'IN_PROGRESS', 'PENDING'] };
          queryTitle = "Next Patient Consultation";
          proLimit = 1;
        } else {
          proAptQuery.dateString = { $gte: dateCtx.todayStr };
          proAptQuery.status = { $in: ['BOOKED', 'CONFIRMED', 'PENDING', 'WAITING', 'ARRIVED', 'CALLED', 'IN_PROGRESS', 'RESCHEDULED', 'RESCHEDULE_REQUESTED'] };
          queryTitle = "Upcoming Practice Consultations";
        }

        const proAppointments = await Appointment.find(proAptQuery)
          .select('appointmentCode customerName customerPhone dateString startTime endTime bookingType queueNumber status fee appointmentTypeName')
          .sort({ dateString: 1, startTime: 1, queueNumber: 1 })
          .limit(proLimit)
          .lean();

        if (proAppointments && proAppointments.length > 0) {
          structuredData = {
            type: 'appointments',
            title: queryTitle,
            items: proAppointments.map((apt) => ({
              appointmentCode: apt.appointmentCode,
              client: apt.customerName,
              date: apt.dateString,
              time: apt.startTime || (apt.queueNumber ? `Token #${apt.queueNumber}` : 'Queue'),
              status: apt.status,
              service: apt.appointmentTypeName || 'Consultation',
              token: apt.queueNumber ? String(apt.queueNumber) : null,
              fee: `₹${apt.fee || 0}`,
              bookingType: apt.bookingType || 'TIME_SLOT',
            })),
          };

          contextParts.push(`\nProfessional Schedule (${queryTitle} - ${proAppointments.length} record(s)):`);
          proAppointments.forEach((apt, idx) => {
            contextParts.push(
              `${idx + 1}. Code: ${apt.appointmentCode} | Patient: ${apt.customerName} | Date: ${apt.dateString} | Time: ${apt.startTime || 'Token #' + apt.queueNumber} | Status: ${apt.status} | Service: ${apt.appointmentTypeName} | Fee: ₹${apt.fee}`
            );
          });
        } else {
          contextParts.push(`\nProfessional Schedule: No consultations found for ${queryTitle}.`);
        }
      }

      // Availability / Shifts
      else if (intent.type === 'PRO_AVAILABILITY') {
        const availabilities = await Availability.find({ professionalId: proId }).lean();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const availabilityItems = days.map((dayName, idx) => {
          const av = availabilities.find((a) => a.dayOfWeek === idx);
          if (av && av.enabled && av.timeRanges && av.timeRanges.length > 0) {
            return {
              day: dayName,
              enabled: true,
              hours: av.timeRanges.map((r) => `${r.startTime} - ${r.endTime}`).join(', '),
            };
          }
          return { day: dayName, enabled: false, hours: 'Closed' };
        });

        structuredData = {
          type: 'availability',
          title: 'Weekly Practice Availability & Shifts',
          items: availabilityItems,
        };

        contextParts.push(`\nWeekly Availability Configuration:`);
        availabilityItems.forEach((item) => {
          contextParts.push(`- ${item.day}: ${item.enabled ? `Enabled (${item.hours})` : 'Closed'}`);
        });
      }

      // Services / Tariffs
      else if (intent.type === 'PRO_SERVICES') {
        const services = await AppointmentType.find({ professionalId: proId })
          .select('name fee duration enabled bookingType')
          .lean();

        structuredData = {
          type: 'services',
          title: 'Configured Consultation Services & Tariffs',
          items: services.map((s) => ({
            name: s.name,
            fee: `₹${s.fee}`,
            duration: `${s.duration} mins`,
            status: s.enabled ? 'Active' : 'Inactive',
            type: s.bookingType || 'Slot',
          })),
        };

        contextParts.push(`\nConfigured Consultation Services:`);
        services.forEach((s) => {
          contextParts.push(`- ${s.name}: ₹${s.fee} (${s.duration} mins) - ${s.enabled ? 'Active' : 'Inactive'}`);
        });
      }

      // Practice Profile
      else if (intent.type === 'PRO_PROFILE') {
        contextParts.push(
          `\nPractice Profile Details: Name: "${proProfile.name}", Profession: "${proProfile.profession}", Specialization: "${proProfile.specialization}", Booking Slug: "${proProfile.bookingSlug}", Consultation Fee: ₹${proProfile.consultationFee}, City: "${proProfile.city}", Status: "${proProfile.status}"`
        );
      }
    }
  }

  // ==========================================
  // 4. ADMIN DATA RETRIEVAL
  // ==========================================
  if (!structuredData && role === 'ADMIN' && user && user.role === 'ADMIN') {
    if (intent.type === 'ADMIN_METRICS') {
      const [
        totalUsers,
        totalPros,
        totalBookings,
        monthBookings,
        openGrievances,
        paidBookings,
      ] = await Promise.all([
        User.countDocuments({ role: 'USER' }),
        ProfessionalProfile.countDocuments({ status: 'ACTIVE' }),
        Appointment.countDocuments({ status: { $ne: 'HOLD' } }),
        Appointment.countDocuments({
          dateString: { $gte: dateCtx.startOfMonthStr, $lte: dateCtx.endOfMonthStr },
          status: { $ne: 'HOLD' },
        }),
        Grievance.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
        Appointment.countDocuments({ paymentStatus: 'PAID' }),
      ]);

      const adminStats = [
        { label: 'Registered Users', value: totalUsers },
        { label: 'Active Professionals', value: totalPros },
        { label: 'Total Bookings', value: totalBookings },
        { label: `Bookings (${dateCtx.currentMonthName})`, value: monthBookings },
        { label: 'Open Grievances', value: openGrievances },
        { label: 'Paid Appointments', value: paidBookings },
      ];

      structuredData = {
        type: 'statistics',
        title: 'Platform Operational Overview',
        stats: adminStats,
        data: {
          stats: adminStats,
        },
      };

      contextParts.push(`\nPlatform Administrative Metrics:`);
      contextParts.push(`- Total Registered Users: ${totalUsers}`);
      contextParts.push(`- Total Active Verified Professionals: ${totalPros}`);
      contextParts.push(`- Total Platform Bookings: ${totalBookings}`);
      contextParts.push(`- Bookings This Month (${dateCtx.currentMonthName}): ${monthBookings}`);
      contextParts.push(`- Open Grievances: ${openGrievances}`);
      contextParts.push(`- Total Paid Appointments: ${paidBookings}`);
    }
  }

  const contextText = contextParts.join('\n').trim();

  return {
    contextText,
    hasData: contextText.length > 0,
    isGeneral: false,
    intent: intent.type,
    structuredData,
    analysis,
  };
};

function isGeneralGreeting(text) {
  const greetings = ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'pranam', 'kem cho', 'kemon acho', 'good morning', 'good evening', 'good afternoon'];
  const trimmed = (text || '').trim().toLowerCase().replace(/[?!.,]/g, '');
  return greetings.includes(trimmed);
}
