import { AiChatUsage } from '../models/AiChatUsage.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { ProfessionalSubscription } from '../models/ProfessionalSubscription.js';

/**
 * Returns today's date in YYYY-MM-DD format (Indian Standard Time Asia/Kolkata)
 */
export function getTodayDateIST() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Determine AI message limits based on role & subscription plan:
 * - USER: 10 queries / day
 * - PROFESSIONAL (Free Account): 5 queries / day
 * - PROFESSIONAL (Pro Account): 25 queries / day
 * - ADMIN: Unlimited (Infinity)
 * - GUEST: 5 queries / day
 */
export async function getAiLimitForUser({ user, profile }) {
  const role = user?.role || 'GUEST';

  if (role === 'ADMIN') {
    return {
      limit: Infinity,
      isUnlimited: true,
      role: 'ADMIN',
      plan: 'UNLIMITED',
      planLabel: 'Super Admin (Unlimited)',
    };
  }

  if (role === 'USER') {
    return {
      limit: 10,
      isUnlimited: false,
      role: 'USER',
      plan: 'USER',
      planLabel: 'Customer Account (10 msgs/day)',
    };
  }

  if (role === 'PROFESSIONAL') {
    let proProfile = profile;
    if (!proProfile && user) {
      proProfile = await ProfessionalProfile.findOne({ userId: user._id });
    }

    const now = new Date();
    let isPro =
      proProfile?.plan === 'PRO' &&
      (!proProfile.planExpiresAt || new Date(proProfile.planExpiresAt) > now);

    if (!isPro && proProfile) {
      const activeSub = await ProfessionalSubscription.findOne({
        professionalId: proProfile._id,
        status: 'ACTIVE',
        planKey: { $in: ['PRO_MONTHLY', 'PRO_QUARTERLY', 'PRO_HALF_YEARLY', 'PRO_YEARLY', 'CLINIC_ENTERPRISE'] },
      });
      if (activeSub) isPro = true;
    }

    if (isPro) {
      return {
        limit: 25,
        isUnlimited: false,
        role: 'PROFESSIONAL',
        plan: 'PRO',
        planLabel: 'Pro Practice (25 msgs/day)',
      };
    }

    return {
      limit: 5,
      isUnlimited: false,
      role: 'PROFESSIONAL',
      plan: 'FREE',
      planLabel: 'Free Solo Practitioner (5 msgs/day)',
    };
  }

  // GUEST
  return {
    limit: 3,
    isUnlimited: false,
    role: 'GUEST',
    plan: 'GUEST',
    planLabel: 'Guest Visitor (3 msgs/day)',
  };
}

/**
 * Check current usage without incrementing
 */
export async function checkAiUsage({ user, profile, ip = '' }) {
  const identifier = user ? `user:${user._id.toString()}` : `ip:${ip || 'unknown'}`;
  const date = getTodayDateIST();
  const limitInfo = await getAiLimitForUser({ user, profile });

  const record = await AiChatUsage.findOne({ identifier, date });
  const count = record?.count || 0;
  const isAllowed = limitInfo.isUnlimited || count < limitInfo.limit;
  const remaining = limitInfo.isUnlimited ? 'Unlimited' : Math.max(0, limitInfo.limit - count);

  return {
    isAllowed,
    count,
    limit: limitInfo.isUnlimited ? 'Unlimited' : limitInfo.limit,
    remaining,
    isUnlimited: limitInfo.isUnlimited,
    role: limitInfo.role,
    plan: limitInfo.plan,
    planLabel: limitInfo.planLabel,
    date,
  };
}

/**
 * Consume one AI query token. Returns { isAllowed, count, limit, remaining, ... }
 */
export async function consumeAiQuery({ user, profile, ip = '' }) {
  const identifier = user ? `user:${user._id.toString()}` : `ip:${ip || 'unknown'}`;
  const date = getTodayDateIST();
  const limitInfo = await getAiLimitForUser({ user, profile });

  if (limitInfo.isUnlimited) {
    // Record for usage metrics without blocking
    await AiChatUsage.findOneAndUpdate(
      { identifier, date },
      {
        $inc: { count: 1 },
        $set: {
          userId: user?._id || null,
          role: limitInfo.role,
          plan: limitInfo.plan,
          lastUsedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return {
      isAllowed: true,
      count: 0,
      limit: 'Unlimited',
      remaining: 'Unlimited',
      isUnlimited: true,
      role: limitInfo.role,
      plan: limitInfo.plan,
      planLabel: limitInfo.planLabel,
    };
  }

  // Atomically check and increment if count < limit
  const record = await AiChatUsage.findOneAndUpdate(
    { identifier, date, count: { $lt: limitInfo.limit } },
    {
      $inc: { count: 1 },
      $set: {
        userId: user?._id || null,
        role: limitInfo.role,
        plan: limitInfo.plan,
        lastUsedAt: new Date(),
      },
    },
    { upsert: false, new: true }
  );

  if (!record) {
    // Check if a record exists to distinguish between first query of the day vs limit exceeded
    const existing = await AiChatUsage.findOne({ identifier, date });
    if (!existing) {
      // First query of the day for this user
      const created = await AiChatUsage.create({
        identifier,
        userId: user?._id || null,
        date,
        role: limitInfo.role,
        plan: limitInfo.plan,
        count: 1,
        lastUsedAt: new Date(),
      });
      return {
        isAllowed: true,
        count: 1,
        limit: limitInfo.limit,
        remaining: limitInfo.limit - 1,
        isUnlimited: false,
        role: limitInfo.role,
        plan: limitInfo.plan,
        planLabel: limitInfo.planLabel,
      };
    }

    // Limit reached or exceeded
    return {
      isAllowed: false,
      count: existing.count,
      limit: limitInfo.limit,
      remaining: 0,
      isUnlimited: false,
      role: limitInfo.role,
      plan: limitInfo.plan,
      planLabel: limitInfo.planLabel,
      reason: getLimitExceededMessage(limitInfo),
    };
  }

  return {
    isAllowed: true,
    count: record.count,
    limit: limitInfo.limit,
    remaining: Math.max(0, limitInfo.limit - record.count),
    isUnlimited: false,
    role: limitInfo.role,
    plan: limitInfo.plan,
    planLabel: limitInfo.planLabel,
  };
}

export function getLimitExceededMessage(limitInfo) {
  if (limitInfo.role === 'USER') {
    return 'You have reached your daily limit of **10 AI queries** for today.\n\nYour limit will refresh automatically at midnight (IST). For immediate booking inquiries, view your [Appointments](/dashboard/appointments).';
  }
  if (limitInfo.role === 'PROFESSIONAL' && limitInfo.plan === 'FREE') {
    return 'You have reached your daily limit of **5 AI queries** on the Free Solo Practitioner plan.\n\n⭐ **Upgrade to BookSaathi Pro** to unlock **25 AI queries per day**, automated WhatsApp reminders, custom vanity handles, and practice insights.';
  }
  if (limitInfo.role === 'PROFESSIONAL' && limitInfo.plan === 'PRO') {
    return 'You have reached your Pro daily limit of **25 AI queries** for today.\n\nYour daily quota will refresh at midnight (IST).';
  }
  return 'You have reached the daily limit of **3 AI queries** for guest visitors.\n\nPlease log in or create a free account to continue.';
}
