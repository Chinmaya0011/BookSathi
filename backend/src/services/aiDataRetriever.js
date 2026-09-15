import { User } from '../models/User.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Appointment } from '../models/Appointment.js';
import { Availability } from '../models/Availability.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { AppointmentType } from '../models/AppointmentType.js';
import { Payment } from '../models/Payment.js';
import { Grievance } from '../models/Grievance.js';
import { QrBannerOrder } from '../models/QrBannerOrder.js';
import { getDateString } from '../utils/dateHelpers.js';

/**
 * Utility to calculate localized dates in Indian Standard Time (Asia/Kolkata)
 */
function getIndianDateContext() {
  const now = new Date();
  const timezone = 'Asia/Kolkata';

  // Format today's date in YYYY-MM-DD
  const todayStr = getDateString(now, timezone);

  // Tomorrow
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = getDateString(tomorrow, timezone);

  // Yesterday
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = getDateString(yesterday, timezone);

  // Start & End of current month
  const [year, month] = todayStr.split('-').map(Number);
  const startOfMonthStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endOfMonthStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Start of this week (Monday) and end of week (Sunday)
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
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
  };
}

/**
 * Determine and retrieve the minimum necessary database data for a user query
 */
export const retrieveDatabaseDataForQuery = async ({
  user = null,
  profile = null,
  role = 'GUEST',
  message = '',
}) => {
  const text = (message || '').toLowerCase();
  const dateCtx = getIndianDateContext();

  // If question is pure general FAQ and has no application data keywords, return null
  const isGeneralFaqOnly = isGeneralQuestion(text);
  if (isGeneralFaqOnly) {
    return {
      contextText: '',
      hasData: false,
      isGeneral: true,
    };
  }

  // Check for unauthorized access attempts
  if (role === 'USER') {
    if (
      text.includes('all users') ||
      text.includes('total revenue') ||
      text.includes('other patient') ||
      text.includes('all bookings') ||
      text.includes('platform metric') ||
      text.includes('system setting') ||
      text.includes('admin stats')
    ) {
      return {
        contextText:
          'UNAUTHORIZED_REQUEST: You do not have permission to access global system statistics or other users’ private information.',
        hasData: true,
        isUnauthorized: true,
      };
    }
  } else if (role === 'PROFESSIONAL') {
    if (
      text.includes('other doctor') ||
      text.includes('other professional') ||
      text.includes('total platform revenue') ||
      text.includes('system setting') ||
      text.includes('admin stats')
    ) {
      return {
        contextText:
          'UNAUTHORIZED_REQUEST: You do not have permission to access other professionals’ accounts or platform-wide administrative metrics.',
        hasData: true,
        isUnauthorized: true,
      };
    }
  }

  let contextParts = [];

  // ==========================================
  // 1. USER / CUSTOMER DATA RETRIEVAL
  // ==========================================
  if (role === 'USER' && user) {
    const userOr = [{ userId: user._id }];
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

    const baseUserFilter = { $or: userOr };

    // Numerical / count queries
    if (
      text.includes('how many') ||
      text.includes('count') ||
      text.includes('number of appointment') ||
      text.includes('total appointment')
    ) {
      let filter = { ...baseUserFilter };
      let timeLabel = 'all time';

      if (text.includes('tomorrow')) {
        filter.dateString = dateCtx.tomorrowStr;
        timeLabel = `tomorrow (${dateCtx.tomorrowStr})`;
      } else if (text.includes('today')) {
        filter.dateString = dateCtx.todayStr;
        timeLabel = `today (${dateCtx.todayStr})`;
      } else if (text.includes('this week') || text.includes('week')) {
        filter.dateString = { $gte: dateCtx.startOfWeekStr, $lte: dateCtx.endOfWeekStr };
        timeLabel = `this week (${dateCtx.startOfWeekStr} to ${dateCtx.endOfWeekStr})`;
      } else if (text.includes('this month') || text.includes('month')) {
        filter.dateString = { $gte: dateCtx.startOfMonthStr, $lte: dateCtx.endOfMonthStr };
        timeLabel = `this month (${dateCtx.startOfMonthStr} to ${dateCtx.endOfMonthStr})`;
      }

      if (text.includes('cancelled') || text.includes('cancel')) {
        filter.status = { $in: ['CANCELLED', 'REJECTED'] };
      } else if (text.includes('completed') || text.includes('done')) {
        filter.status = { $in: ['COMPLETED', 'DONE'] };
      } else if (text.includes('upcoming')) {
        filter.dateString = { $gte: dateCtx.todayStr };
        filter.status = { $in: ['CONFIRMED', 'BOOKED', 'PENDING', 'WAITING', 'IN_PROGRESS', 'RESCHEDULE_REQUESTED'] };
      }

      const count = await Appointment.countDocuments(filter);
      contextParts.push(
        `User Appointment Count (${timeLabel}): ${count} matching appointment(s) found in the database for user ${user.name || user.email}.`
      );
    }

    // Specific list queries (Tomorrow, Today, Next, Upcoming, Cancelled, History)
    let appointmentQuery = { ...baseUserFilter };
    let limit = 5;

    if (text.includes('tomorrow')) {
      appointmentQuery.dateString = dateCtx.tomorrowStr;
      appointmentQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] };
    } else if (text.includes('today')) {
      appointmentQuery.dateString = dateCtx.todayStr;
      appointmentQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] };
    } else if (text.includes('next') || text.includes('upcoming') || text.includes('schedule')) {
      appointmentQuery.dateString = { $gte: dateCtx.todayStr };
      appointmentQuery.status = { $in: ['CONFIRMED', 'BOOKED', 'PENDING', 'WAITING', 'IN_PROGRESS', 'RESCHEDULE_REQUESTED'] };
      limit = 5;
    } else if (text.includes('cancelled') || text.includes('reject')) {
      appointmentQuery.status = { $in: ['CANCELLED', 'REJECTED'] };
      limit = 5;
    } else if (text.includes('past') || text.includes('history') || text.includes('previous')) {
      appointmentQuery.dateString = { $lt: dateCtx.todayStr };
      limit = 5;
    } else if (text.includes('appointment') || text.includes('booking') || text.includes('consultation')) {
      // General appointment status query - fetch latest upcoming or active
      appointmentQuery.dateString = { $gte: dateCtx.todayStr };
      appointmentQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] };
      limit = 5;
    }

    // Fetch minimum relevant appointments
    const appointments = await Appointment.find(appointmentQuery)
      .select('appointmentCode dateString startTime endTime bookingType queueNumber status fee customerName appointmentTypeName rescheduleRequest')
      .populate('professionalId', 'name profession specialization city phone consultationFee')
      .sort({ dateString: 1, startTime: 1 })
      .limit(limit)
      .lean();

    if (appointments && appointments.length > 0) {
      contextParts.push(`\nAuthenticated User Appointments (${appointments.length} record(s)):`);
      appointments.forEach((apt, idx) => {
        const pro = apt.professionalId || {};
        contextParts.push(
          `${idx + 1}. Code: ${apt.appointmentCode} | Date: ${apt.dateString} | Time: ${apt.startTime || 'Queue'} | Status: ${apt.status} | Professional: ${pro.name || 'Specialist'} (${pro.profession || 'Doctor'}, ${pro.specialization || ''}) | Service: ${apt.appointmentTypeName || 'Consultation'} | Fee: ₹${apt.fee || pro.consultationFee || 0}`
        );
      });
    } else if (Object.keys(appointmentQuery).length > 1) {
      contextParts.push(`\nAuthenticated User Appointments: No matching appointments found for the specified query in user's account.`);
    }

    // User profile lookup
    if (text.includes('profile') || text.includes('my name') || text.includes('my email') || text.includes('my phone')) {
      contextParts.push(
        `\nUser Profile Details: Name: "${user.name || 'Not specified'}", Email: "${user.email}", Phone: "${user.phone || 'Not specified'}", Role: "${user.role}"`
      );
    }
  }

  // ==========================================
  // 2. PROFESSIONAL DATA RETRIEVAL
  // ==========================================
  if (role === 'PROFESSIONAL' && user) {
    let proProfile = profile;
    if (!proProfile) {
      proProfile = await ProfessionalProfile.findOne({ userId: user._id }).lean();
    }

    if (proProfile) {
      const proId = proProfile._id;

      // Stats & Counts
      if (
        text.includes('how many') ||
        text.includes('count') ||
        text.includes('metric') ||
        text.includes('revenue') ||
        text.includes('statistics')
      ) {
        if (text.includes('today')) {
          const todayCount = await Appointment.countDocuments({
            professionalId: proId,
            dateString: dateCtx.todayStr,
            status: { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] },
          });
          contextParts.push(`Today's Bookings Count (${dateCtx.todayStr}): ${todayCount}`);
        } else if (text.includes('tomorrow')) {
          const tomorrowCount = await Appointment.countDocuments({
            professionalId: proId,
            dateString: dateCtx.tomorrowStr,
            status: { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] },
          });
          contextParts.push(`Tomorrow's Bookings Count (${dateCtx.tomorrowStr}): ${tomorrowCount}`);
        } else if (text.includes('completed') && (text.includes('week') || text.includes('this week'))) {
          const completedWeek = await Appointment.countDocuments({
            professionalId: proId,
            dateString: { $gte: dateCtx.startOfWeekStr, $lte: dateCtx.endOfWeekStr },
            status: { $in: ['DONE', 'COMPLETED'] },
          });
          contextParts.push(`Completed Appointments This Week (${dateCtx.startOfWeekStr} to ${dateCtx.endOfWeekStr}): ${completedWeek}`);
        } else if (text.includes('this month') || text.includes('month')) {
          const monthCount = await Appointment.countDocuments({
            professionalId: proId,
            dateString: { $gte: dateCtx.startOfMonthStr, $lte: dateCtx.endOfMonthStr },
            status: { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] },
          });
          contextParts.push(`Total Bookings This Month (${dateCtx.startOfMonthStr} to ${dateCtx.endOfMonthStr}): ${monthCount}`);
        }
      }

      // Schedule & Appointments retrieval
      let proAptQuery = { professionalId: proId };
      let proLimit = 6;

      if (text.includes('today')) {
        proAptQuery.dateString = dateCtx.todayStr;
        proAptQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] };
      } else if (text.includes('tomorrow')) {
        proAptQuery.dateString = dateCtx.tomorrowStr;
        proAptQuery.status = { $nin: ['CANCELLED', 'REJECTED', 'EXPIRED'] };
      } else if (text.includes('upcoming') || text.includes('next') || text.includes('appointments') || text.includes('bookings')) {
        proAptQuery.dateString = { $gte: dateCtx.todayStr };
        proAptQuery.status = { $in: ['BOOKED', 'CONFIRMED', 'PENDING', 'WAITING', 'CALLED', 'IN_PROGRESS', 'RESCHEDULE_REQUESTED'] };
      } else if (text.includes('cancelled')) {
        proAptQuery.status = { $in: ['CANCELLED', 'REJECTED'] };
      }

      const proAppointments = await Appointment.find(proAptQuery)
        .select('appointmentCode customerName customerPhone dateString startTime endTime bookingType queueNumber status fee appointmentTypeName')
        .sort({ dateString: 1, startTime: 1, queueNumber: 1 })
        .limit(proLimit)
        .lean();

      if (proAppointments && proAppointments.length > 0) {
        contextParts.push(`\nProfessional Schedule Records (${proAppointments.length} item(s)):`);
        proAppointments.forEach((apt, idx) => {
          contextParts.push(
            `${idx + 1}. Code: ${apt.appointmentCode} | Client: ${apt.customerName} | Date: ${apt.dateString} | Time: ${apt.startTime || 'Token #' + apt.queueNumber} | Status: ${apt.status} | Service: ${apt.appointmentTypeName} | Fee: ₹${apt.fee}`
          );
        });
      }

      // Availability / Shifts lookup
      if (text.includes('availability') || text.includes('shift') || text.includes('working hour') || text.includes('slots') || text.includes('timing')) {
        const availabilities = await Availability.find({ professionalId: proId }).lean();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (availabilities && availabilities.length > 0) {
          contextParts.push(`\nWeekly Availability Configuration:`);
          availabilities.forEach((av) => {
            const dayName = days[av.dayOfWeek] || `Day ${av.dayOfWeek}`;
            if (av.enabled && av.timeRanges && av.timeRanges.length > 0) {
              const ranges = av.timeRanges.map((r) => `${r.startTime} - ${r.endTime}`).join(', ');
              contextParts.push(`- ${dayName}: Enabled (${ranges})`);
            } else {
              contextParts.push(`- ${dayName}: Closed / Disabled`);
            }
          });
        }
      }

      // Services / Tariffs lookup
      if (text.includes('service') || text.includes('tariff') || text.includes('fee') || text.includes('price') || text.includes('consultation type')) {
        const services = await AppointmentType.find({ professionalId: proId }).lean();
        if (services && services.length > 0) {
          contextParts.push(`\nConfigured Consultation Services:`);
          services.forEach((s) => {
            contextParts.push(`- ${s.name}: ₹${s.fee} (${s.duration} mins) - ${s.enabled ? 'Active' : 'Inactive'}`);
          });
        }
      }

      // Profile details
      if (text.includes('profile') || text.includes('slug') || text.includes('link') || text.includes('clinic')) {
        contextParts.push(
          `\nPractice Profile Details: Name: "${proProfile.name}", Profession: "${proProfile.profession}", Specialization: "${proProfile.specialization}", Booking Slug: "${proProfile.bookingSlug}", Consultation Fee: ₹${proProfile.consultationFee}, City: "${proProfile.city}", Status: "${proProfile.status}"`
        );
      }
    }
  }

  // ==========================================
  // 3. ADMIN DATA RETRIEVAL
  // ==========================================
  if (role === 'ADMIN' && user && user.role === 'ADMIN') {
    if (
      text.includes('stat') ||
      text.includes('metric') ||
      text.includes('overview') ||
      text.includes('how many') ||
      text.includes('total') ||
      text.includes('summary') ||
      text.includes('revenue') ||
      text.includes('user') ||
      text.includes('booking')
    ) {
      const [
        totalUsers,
        totalPros,
        totalBookings,
        monthBookings,
        openGrievances,
        activeSubscriptions,
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

      contextParts.push(`\nPlatform Administrative Metrics:`);
      contextParts.push(`- Total Registered Users: ${totalUsers}`);
      contextParts.push(`- Total Active Verified Professionals: ${totalPros}`);
      contextParts.push(`- Total Platform Bookings Created: ${totalBookings}`);
      contextParts.push(`- Bookings Created This Month (${dateCtx.startOfMonthStr} to ${dateCtx.endOfMonthStr}): ${monthBookings}`);
      contextParts.push(`- Open Customer/Pro Grievance Tickets: ${openGrievances}`);
      contextParts.push(`- Total Paid Appointments: ${activeSubscriptions}`);
    }
  }

  // ==========================================
  // 4. PUBLIC / DIRECTORY DATA SEARCH (FOR ALL)
  // ==========================================
  if (
    text.includes('find') ||
    text.includes('doctor') ||
    text.includes('ca') ||
    text.includes('lawyer') ||
    text.includes('specialist') ||
    text.includes('search') ||
    text.includes('bhubaneswar') ||
    text.includes('delhi') ||
    text.includes('mumbai')
  ) {
    // Only search if user explicitly asks for professional directory or finding experts
    const searchFilter = { isPublic: true, status: 'ACTIVE' };
    if (text.includes('doctor')) searchFilter.profession = 'Doctor';
    else if (text.includes('ca')) searchFilter.profession = 'CA';
    else if (text.includes('lawyer')) searchFilter.profession = 'Lawyer';

    const directoryMatches = await ProfessionalProfile.find(searchFilter)
      .select('name profession specialization city consultationFee bookingSlug languages')
      .limit(3)
      .lean();

    if (directoryMatches && directoryMatches.length > 0) {
      contextParts.push(`\nPublic Verified Professionals Directory Sample:`);
      directoryMatches.forEach((d) => {
        contextParts.push(
          `- ${d.name} (${d.profession} - ${d.specialization}) in ${d.city} | Fee: ₹${d.consultationFee} | Booking Link: /profile/${d.bookingSlug}`
        );
      });
    }
  }

  const contextText = contextParts.join('\n').trim();

  return {
    contextText,
    hasData: contextText.length > 0,
    isGeneral: false,
  };
};

/**
 * Checks if a message is purely a generic question requiring no database access
 */
function isGeneralQuestion(text) {
  const genericQuestions = [
    'what is an appointment',
    'what is booksaathi',
    'how does ai work',
    'how can i prepare for a consultation',
    'what to ask a doctor',
    'tips for consultation',
    'hello',
    'hi',
    'hey',
    'good morning',
    'good evening',
    'who are you',
    'what can you do',
  ];

  const trimmed = text.trim().replace(/[?!.,]/g, '');
  if (genericQuestions.includes(trimmed)) return true;

  return false;
}
