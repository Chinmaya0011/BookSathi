import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Appointment } from '../models/Appointment.js';
import { Payment } from '../models/Payment.js';
import { SystemAuditLog } from '../models/SystemAuditLog.js';
import { QrBannerOrder } from '../models/QrBannerOrder.js';
import { ProfessionalSubscription } from '../models/ProfessionalSubscription.js';
import { PricingPlan } from '../models/PricingPlan.js';
import { Grievance } from '../models/Grievance.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { getDateString } from '../utils/dateHelpers.js';
import { toAdminAppointment } from '../serializers/appointmentSerializer.js';

/**
 * Helper to record Super Admin actions
 */
export const recordAuditLog = async ({
  adminId,
  adminEmail,
  action,
  targetType,
  targetId,
  details = {},
  ipAddress = '',
}) => {
  try {
    await SystemAuditLog.create({
      adminId,
      adminEmail,
      action,
      targetType,
      targetId: String(targetId || ''),
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

/**
 * 1. Master Command Center Overview Statistics
 */
export const getSystemOverviewStats = async () => {
  const todayString = getDateString(new Date(), 'Asia/Kolkata');
  const [year, month] = todayString.split('-');
  const monthPrefix = `${year}-${month}`;

  const [
    totalUsers,
    totalProfessionals,
    activeProfessionals,
    totalAppointments,
    todayAppointments,
    allPayments,
    totalQrOrders,
    pendingQrOrders,
    totalGrievances,
    openGrievances,
    activeSubscriptions,
    recentAuditLogs,
  ] = await Promise.all([
    User.countDocuments(),
    ProfessionalProfile.countDocuments(),
    ProfessionalProfile.countDocuments({ isPublic: true, status: 'ACTIVE' }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ dateString: todayString }),
    Payment.find({ status: 'SUCCESS' }).select('amount createdAt paymentMethod paymentMode').lean(),
    QrBannerOrder.countDocuments(),
    QrBannerOrder.countDocuments({ orderStatus: { $in: ['PAYMENT_PENDING', 'ORDER_PLACED', 'IN_PRINTING'] } }),
    Grievance.countDocuments(),
    Grievance.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
    ProfessionalSubscription.countDocuments({ status: 'ACTIVE' }),
    SystemAuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  // Financial aggregation
  const totalVolume = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const monthVolume = allPayments
    .filter((p) => p.createdAt && new Date(p.createdAt).toISOString().startsWith(monthPrefix))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const todayVolume = allPayments
    .filter((p) => p.createdAt && getDateString(new Date(p.createdAt), 'Asia/Kolkata') === todayString)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Appointment status counts
  const [confirmedCount, completedCount, cancelledCount, pendingCount] = await Promise.all([
    Appointment.countDocuments({ status: 'CONFIRMED' }),
    Appointment.countDocuments({ status: 'COMPLETED' }),
    Appointment.countDocuments({ status: 'CANCELLED' }),
    Appointment.countDocuments({ status: 'PENDING' }),
  ]);

  // 7-day rolling trend
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const trend = [];
  const todayObj = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayObj);
    d.setDate(todayObj.getDate() - i);
    const dateStr = getDateString(d, 'Asia/Kolkata');
    const dayName = daysOfWeek[d.getDay()];

    const dayAppts = await Appointment.countDocuments({ dateString: dateStr });
    const dayPayments = allPayments.filter(
      (p) => p.createdAt && getDateString(new Date(p.createdAt), 'Asia/Kolkata') === dateStr
    );
    const dayRevenue = dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    trend.push({
      date: dateStr,
      day: dayName,
      appointments: dayAppts,
      revenue: dayRevenue,
    });
  }

  // System Health
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  const memoryUsageMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const uptimeSeconds = Math.round(process.uptime());

  return {
    kpis: {
      totalUsers,
      totalProfessionals,
      activeProfessionals,
      totalAppointments,
      todayAppointments,
      totalVolume,
      monthVolume,
      todayVolume,
      totalQrOrders,
      pendingQrOrders,
      totalGrievances,
      openGrievances,
      activeSubscriptions,
    },
    appointmentStatus: {
      CONFIRMED: confirmedCount,
      COMPLETED: completedCount,
      CANCELLED: cancelledCount,
      PENDING: pendingCount,
    },
    weeklyTrend: trend,
    recentAuditLogs,
    systemHealth: {
      database: dbStatus,
      uptimeSeconds,
      memoryUsageMB,
      activeGateway: process.env.PAYMENT_GATEWAY_DEFAULT || 'SIMULATED',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    },
  };
};

/**
 * 2. Professional Directory Management
 */
export const getAllProfessionals = async (query = {}) => {
  const { search, profession, status, isVerified, page = 1, limit = 20 } = query;
  const filter = {};

  if (profession) filter.profession = profession;
  if (status) filter.status = status;
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true' || isVerified === true;

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { bookingSlug: regex },
      { city: regex },
      { specialization: regex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [professionals, total] = await Promise.all([
    ProfessionalProfile.find(filter)
      .populate('userId', 'email role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    ProfessionalProfile.countDocuments(filter),
  ]);

  return {
    professionals,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * 3. Update Professional Status & Verification (Admin action)
 */
export const updateProfessionalAdmin = async (profileId, adminUser, data) => {
  const profile = await ProfessionalProfile.findById(profileId);
  if (!profile) {
    const err = new Error('Professional profile not found');
    err.statusCode = 404;
    throw err;
  }

  const { isVerified, status, consultationFee, isPublic, bookingSlug } = data;

  if (isVerified !== undefined) profile.isVerified = isVerified;
  if (status !== undefined) profile.status = status;
  if (consultationFee !== undefined) profile.consultationFee = Number(consultationFee);
  if (isPublic !== undefined) profile.isPublic = isPublic;
  if (bookingSlug) profile.bookingSlug = bookingSlug.toLowerCase().trim();

  await profile.save();

  await recordAuditLog({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'UPDATE_PROFESSIONAL_PROFILE',
    targetType: 'PROFESSIONAL',
    targetId: profile._id,
    details: { changes: data, professionalName: profile.name },
  });

  return profile;
};

/**
 * 4. Global Appointments Control
 */
export const getAllAppointmentsAdmin = async (query = {}) => {
  const { search, status, professionalId, date, page = 1, limit = 25 } = query;
  const filter = {};

  if (status) filter.status = status;
  if (professionalId) filter.professionalId = professionalId;
  if (date) filter.dateString = date;

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { customerName: regex },
      { customerPhone: regex },
      { customerEmail: regex },
      { appointmentCode: regex },
      { appointmentTypeName: regex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('professionalId', 'name profession bookingSlug phone email')
      .sort({ dateString: -1, startTime: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Appointment.countDocuments(filter),
  ]);

  return {
    appointments: appointments.map((a) => toAdminAppointment(a, { auditLogged: false })),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * 4b. Get Single Appointment Details with Notes (Admin read - writes SystemAuditLog)
 */
export const getAppointmentDetailsAdmin = async (appointmentId, adminUser, ipAddress = '') => {
  const appointment = await Appointment.findById(appointmentId)
    .select('+notes +notesUpdatedAt +notesUpdatedBy')
    .populate('professionalId', 'name profession bookingSlug phone email')
    .populate('appointmentTypeId', 'name duration fee')
    .populate('userId', 'name email phone');

  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  // Mandatory SystemAuditLog on admin viewing private clinical/consultation notes
  await recordAuditLog({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'READ_APPOINTMENT_NOTES',
    targetType: 'APPOINTMENT',
    targetId: appointment._id,
    details: {
      appointmentCode: appointment.appointmentCode,
      hasNotes: Boolean(appointment.notes),
      customerName: appointment.customerName,
    },
    ipAddress,
  });

  return toAdminAppointment(appointment, { auditLogged: true });
};

/**
 * 4c. Update Appointment Clinical Notes by Admin (Admin write - writes SystemAuditLog)
 */
export const updateAppointmentNotesAdmin = async (appointmentId, adminUser, notes, ipAddress = '') => {
  const appointment = await Appointment.findById(appointmentId).select('+notes');
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  const oldNotesLength = appointment.notes ? appointment.notes.length : 0;
  appointment.notes = notes;
  appointment.notesUpdatedAt = new Date();
  appointment.notesUpdatedBy = 'ADMIN';
  await appointment.save();

  // Mandatory SystemAuditLog on admin updating notes
  await recordAuditLog({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'UPDATE_APPOINTMENT_NOTES',
    targetType: 'APPOINTMENT',
    targetId: appointment._id,
    details: {
      appointmentCode: appointment.appointmentCode,
      oldNotesLength,
      newNotesLength: notes ? notes.length : 0,
      notesUpdatedBy: 'ADMIN',
    },
    ipAddress,
  });

  return toAdminAppointment(appointment, { auditLogged: true });
};

/**
 * 5. Admin Override of Appointment Status
 */
export const updateAppointmentStatusAdmin = async (appointmentId, adminUser, { status, cancelReason }) => {
  const appointment = await Appointment.findById(appointmentId).populate('professionalId', 'name email');
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  const oldStatus = appointment.status;
  appointment.status = status;
  if (cancelReason) appointment.cancelReason = cancelReason;
  await appointment.save();

  await recordAuditLog({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'OVERRIDE_APPOINTMENT_STATUS',
    targetType: 'APPOINTMENT',
    targetId: appointment._id,
    details: {
      appointmentCode: appointment.appointmentCode,
      from: oldStatus,
      to: status,
      cancelReason,
    },
  });

  return toAdminAppointment(appointment);
};

/**
 * 6. Global Platform Payments & Transactions
 */
export const getAllPaymentsAdmin = async (query = {}) => {
  const { search, status, paymentMode, paymentMethod, page = 1, limit = 25 } = query;
  const filter = {};

  if (status) filter.status = status;
  if (paymentMode) filter.paymentMode = paymentMode;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { customerName: regex },
      { customerPhone: regex },
      { invoiceNumber: regex },
      { paymentCode: regex },
      { gatewayOrderId: regex },
      { gatewayPaymentId: regex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('professionalId', 'name profession bookingSlug')
      .populate('appointmentId', 'appointmentCode dateString startTime endTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * 7. User & RBAC Management
 */
export const getAllUsersAdmin = async (query = {}) => {
  const { search, role, isActive, page = 1, limit = 25 } = query;
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.email = regex;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * 8. Update User Role / Lock / Password with Strict Role Elevation & Audit Logging
 */
export const updateUserAdmin = async (userId, adminUser, data) => {
  if (!adminUser || adminUser.role !== 'ADMIN' || !adminUser.isActive) {
    const err = new Error('Access denied. Active administrator privileges required.');
    err.statusCode = 403;
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const { role, isActive, newPassword, unlockAccount } = data;
  const oldRole = user.role;
  const oldActive = user.isActive;

  // Role Change Rules
  if (role && role !== oldRole) {
    // 1. Target !== Actor Check
    if (user._id.toString() === adminUser._id.toString()) {
      const err = new Error('Cannot modify or elevate your own administrative role.');
      err.statusCode = 400;
      throw err;
    }

    // 2. Role Elevation to ADMIN
    if (role === 'ADMIN') {
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_ADMIN_PROMOTION !== 'true') {
        const err = new Error('Role elevation to ADMIN is disabled in this environment (ALLOW_ADMIN_PROMOTION is not enabled).');
        err.statusCode = 403;
        throw err;
      }

      user.role = 'ADMIN';

      await recordAuditLog({
        adminId: adminUser._id,
        adminEmail: adminUser.email,
        action: 'ROLE_ELEVATION_ADMIN',
        targetType: 'USER',
        targetId: user._id.toString(),
        details: {
          promotedBy: adminUser.email,
          targetUserEmail: user.email,
          previousRole: oldRole,
          newRole: 'ADMIN',
          timestamp: new Date().toISOString(),
        },
      });
    } else if (role === 'PROFESSIONAL') {
      // 3. Role Elevation to PROFESSIONAL (Allowed by Admin)
      user.role = 'PROFESSIONAL';

      // Ensure a Professional Profile exists for the newly elevated professional
      let profile = await ProfessionalProfile.findOne({ userId: user._id });
      if (!profile) {
        let baseSlug = (user.email.split('@')[0] || 'pro').toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (baseSlug.length < 3) baseSlug = 'pro-' + Math.floor(1000 + Math.random() * 9000);
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await ProfessionalProfile.findOne({ bookingSlug: uniqueSlug })) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        profile = await ProfessionalProfile.create({
          userId: user._id,
          name: user.name || user.email.split('@')[0] || 'Professional',
          email: user.email,
          phone: user.phone || '+91 99999 99999',
          profession: 'Doctor',
          specialization: 'General Practice',
          city: 'Bhubaneswar',
          state: 'Odisha',
          bookingSlug: uniqueSlug,
          consultationFee: 500,
          languages: ['English', 'Hindi'],
          yearsOfExperience: 5,
          isPublic: true,
          status: 'ACTIVE',
        });
      }

      await recordAuditLog({
        adminId: adminUser._id,
        adminEmail: adminUser.email,
        action: 'ROLE_ELEVATION_PROFESSIONAL',
        targetType: 'USER',
        targetId: user._id.toString(),
        details: {
          promotedBy: adminUser.email,
          targetUserEmail: user.email,
          previousRole: oldRole,
          newRole: 'PROFESSIONAL',
        },
      });
    } else {
      user.role = role;
      await recordAuditLog({
        adminId: adminUser._id,
        adminEmail: adminUser.email,
        action: 'UPDATE_USER_ROLE',
        targetType: 'USER',
        targetId: user._id.toString(),
        details: {
          changedBy: adminUser.email,
          targetUserEmail: user.email,
          previousRole: oldRole,
          newRole: role,
        },
      });
    }
  }

  // Active / Suspension Status
  if (isActive !== undefined && isActive !== oldActive) {
    user.isActive = isActive;

    // Sync status with ProfessionalProfile if present
    const profile = await ProfessionalProfile.findOne({ userId: user._id });
    if (profile) {
      profile.status = isActive ? 'ACTIVE' : 'SUSPENDED';
      await profile.save();
    }

    await recordAuditLog({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: isActive ? 'USER_ACCOUNT_ACTIVATED' : 'USER_ACCOUNT_SUSPENDED',
      targetType: 'USER',
      targetId: user._id.toString(),
      details: {
        adminEmail: adminUser.email,
        targetUserEmail: user.email,
        newStatus: isActive ? 'ACTIVE' : 'SUSPENDED',
      },
    });
  }

  // Account Unlock
  if (unlockAccount) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await recordAuditLog({
      adminId: adminUser._id,
      adminEmail: adminUser.email,
      action: 'USER_ACCOUNT_UNLOCKED',
      targetType: 'USER',
      targetId: user._id.toString(),
      details: { adminEmail: adminUser.email, targetUserEmail: user.email },
    });
  }

  if (newPassword) {
    user.password = newPassword;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
  }

  await user.save();
  return user;
};

/**
 * 9. QR Standee & Banner Physical Kit Orders Control
 */
export const getAllQrOrdersAdmin = async (query = {}) => {
  const { search, orderStatus, paymentStatus, page = 1, limit = 25 } = query;
  const filter = {};

  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { orderCode: regex },
      { 'shippingAddress.recipientName': regex },
      { 'shippingAddress.phone': regex },
      { 'shippingAddress.city': regex },
      { trackingNumber: regex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    QrBannerOrder.find(filter)
      .populate('professionalId', 'name profession bookingSlug phone email')
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    QrBannerOrder.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Update QR Order Production & Shipping Status
 */
export const updateQrOrderStatusAdmin = async (orderId, adminUser, data) => {
  const order = await QrBannerOrder.findById(orderId);
  if (!order) {
    const err = new Error('QR Kit order not found');
    err.statusCode = 404;
    throw err;
  }

  const { orderStatus, trackingNumber, courierPartner, estimatedDeliveryDate } = data;
  const oldStatus = order.orderStatus;

  if (orderStatus) order.orderStatus = orderStatus;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (courierPartner !== undefined) order.courierPartner = courierPartner;
  if (estimatedDeliveryDate) order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);

  await order.save();

  await recordAuditLog({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'UPDATE_QR_ORDER_STATUS',
    targetType: 'SYSTEM',
    targetId: order._id,
    details: { orderCode: order.orderCode, from: oldStatus, to: orderStatus, trackingNumber },
  });

  return order;
};

/**
 * 10. Subscriptions & Pricing Plans Management
 */
export const getAllSubscriptionsAdmin = async (query = {}) => {
  const { search, status, planKey, page = 1, limit = 25 } = query;
  const filter = {};

  if (status) filter.status = status;
  if (planKey) filter.planKey = planKey;

  const skip = (Number(page) - 1) * Number(limit);

  const [subscriptions, total, pricingPlans] = await Promise.all([
    ProfessionalSubscription.find(filter)
      .populate('professionalId', 'name profession bookingSlug phone email')
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    ProfessionalSubscription.countDocuments(filter),
    PricingPlan.find().sort({ durationMonths: 1 }),
  ]);

  return {
    subscriptions,
    pricingPlans,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const updatePricingPlanAdmin = async (planId, adminUser, data) => {
  const plan = await PricingPlan.findById(planId);
  if (!plan) {
    const err = new Error('Pricing plan not found');
    err.statusCode = 404;
    throw err;
  }

  const { finalPrice, baseMonthlyRate, discountPercent, badge, isPopular, isActive } = data;

  if (finalPrice !== undefined) plan.finalPrice = Number(finalPrice);
  if (baseMonthlyRate !== undefined) plan.baseMonthlyRate = Number(baseMonthlyRate);
  if (discountPercent !== undefined) plan.discountPercent = Number(discountPercent);
  if (badge !== undefined) plan.badge = badge;
  if (isPopular !== undefined) plan.isPopular = isPopular;
  if (isActive !== undefined) plan.isActive = isActive;

  await plan.save();

  await recordAuditLog({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'UPDATE_PRICING_PLAN',
    targetType: 'SYSTEM',
    targetId: plan._id,
    details: { planKey: plan.planKey, changes: data },
  });

  return plan;
};

/**
 * 11. Support & Grievance Tickets Control
 */
export const getAllGrievancesAdmin = async (query = {}) => {
  const { search, status, priority, category, page = 1, limit = 25 } = query;
  const filter = {};

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { ticketId: regex },
      { name: regex },
      { email: regex },
      { subject: regex },
      { referenceCode: regex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [grievances, total] = await Promise.all([
    Grievance.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Grievance.countDocuments(filter),
  ]);

  return {
    grievances,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const updateGrievanceAdmin = async (grievanceId, adminUser, data) => {
  const grievance = await Grievance.findById(grievanceId);
  if (!grievance) {
    const err = new Error('Grievance ticket not found');
    err.statusCode = 404;
    throw err;
  }

  const { status, adminResponse, priority } = data;

  if (status) {
    grievance.status = status;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      grievance.resolvedBy = adminUser._id;
      grievance.resolvedAt = new Date();
    }
  }
  if (adminResponse !== undefined) grievance.adminResponse = adminResponse;
  if (priority) grievance.priority = priority;

  await grievance.save();

  await recordAuditLog({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'UPDATE_GRIEVANCE_TICKET',
    targetType: 'SYSTEM',
    targetId: grievance._id,
    details: { ticketId: grievance.ticketId, status, priority },
  });

  return grievance;
};

/**
 * 12. Centralized Platform Settings & Feature Flags
 */
export const getSystemSettingsAdmin = async () => {
  let settings = await SystemSetting.findOne({ key: 'GLOBAL_CONFIG' });
  if (!settings) {
    settings = await SystemSetting.create({ key: 'GLOBAL_CONFIG' });
  }
  return settings;
};

export const updateSystemSettingsAdmin = async (adminUser, data) => {
  let settings = await SystemSetting.findOne({ key: 'GLOBAL_CONFIG' });
  if (!settings) {
    settings = new SystemSetting({ key: 'GLOBAL_CONFIG' });
  }

  Object.assign(settings, data);
  await settings.save();

  await recordAuditLog({
    adminId: adminUser._id,
    adminEmail: adminUser.email,
    action: 'UPDATE_SYSTEM_SETTINGS',
    targetType: 'SYSTEM',
    targetId: settings._id,
    details: { changes: data },
  });

  return settings;
};

/**
 * 13. Get Audit Logs
 */
export const getAuditLogs = async (query = {}) => {
  const { targetType, action, page = 1, limit = 50 } = query;
  const filter = {};

  if (targetType) filter.targetType = targetType;
  if (action) filter.action = action;

  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    SystemAuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    SystemAuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};
