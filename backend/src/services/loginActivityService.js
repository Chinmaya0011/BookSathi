import { LoginActivity } from '../models/LoginActivity.js';
import { User } from '../models/User.js';
import { parseUserAgent, maskIpAddress, normalizeIp } from '../utils/uaParser.js';

/**
 * Record a login/session security audit log safely without interrupting auth flow
 */
export const recordLoginActivity = async ({
  userId,
  userEmail,
  userRole = 'USER',
  eventType,
  status = 'success',
  ipAddress = '',
  userAgent = '',
  sessionId = '',
  details = {},
}) => {
  try {
    const normIp = normalizeIp(ipAddress);
    const parsedUa = parseUserAgent(userAgent);

    await LoginActivity.create({
      userId,
      userEmail: (userEmail || '').toLowerCase().trim(),
      userRole: (userRole || 'USER').toUpperCase(),
      eventType,
      status,
      ipAddress: normIp,
      userAgent: userAgent || '',
      deviceType: parsedUa.deviceType,
      browser: parsedUa.browser,
      operatingSystem: parsedUa.operatingSystem,
      sessionId: sessionId || '',
      details: details || {},
    });
  } catch (err) {
    console.error('[LoginActivity] Failed to record audit log:', err.message);
  }
};

/**
 * Get paginated login activity for the currently authenticated user
 */
export const getMyLoginActivity = async (user, currentSessionId, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const filter = { userId: user._id };

  const [logs, total] = await Promise.all([
    LoginActivity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LoginActivity.countDocuments(filter),
  ]);

  // Find the latest successful login for current active session info
  const activeSessionLog = user.activeSessionId
    ? await LoginActivity.findOne({
        userId: user._id,
        sessionId: user.activeSessionId,
        eventType: 'LOGIN_SUCCESS',
      })
        .sort({ createdAt: -1 })
        .lean()
    : null;

  const currentSession = activeSessionLog
    ? {
        sessionId: activeSessionLog.sessionId,
        deviceType: activeSessionLog.deviceType,
        browser: activeSessionLog.browser,
        operatingSystem: activeSessionLog.operatingSystem,
        ipAddress: maskIpAddress(activeSessionLog.ipAddress),
        loginAt: activeSessionLog.createdAt,
        isActive: true,
      }
    : {
        sessionId: currentSessionId || user.activeSessionId || '',
        deviceType: 'desktop',
        browser: 'Current Browser',
        operatingSystem: 'Current Device',
        ipAddress: '127.0.0.1',
        loginAt: new Date(),
        isActive: true,
      };

  const formattedLogs = logs.map((log) => {
    const isCurrent =
      Boolean(currentSessionId) &&
      log.sessionId === currentSessionId &&
      log.sessionId === user.activeSessionId &&
      log.eventType === 'LOGIN_SUCCESS';

    return {
      _id: log._id,
      eventType: log.eventType,
      status: log.status,
      deviceType: log.deviceType,
      browser: log.browser,
      operatingSystem: log.operatingSystem,
      ipAddress: maskIpAddress(log.ipAddress),
      sessionId: log.sessionId,
      isCurrentSession: isCurrent,
      details: log.details,
      createdAt: log.createdAt,
    };
  });

  return {
    currentSession,
    logs: formattedLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get platform-wide login activity for administrators with filters and pagination
 */
export const getAdminLoginActivity = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.role && ['USER', 'PROFESSIONAL', 'ADMIN'].includes(query.role.toUpperCase())) {
    filter.userRole = query.role.toUpperCase();
  }

  if (query.eventType) {
    filter.eventType = query.eventType;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ userEmail: searchRegex }, { ipAddress: searchRegex }];
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const [logs, total, stats] = await Promise.all([
    LoginActivity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email role avatar isActive')
      .lean(),
    LoginActivity.countDocuments(filter),
    LoginActivity.aggregate([
      {
        $facet: {
          success24h: [
            {
              $match: {
                eventType: 'LOGIN_SUCCESS',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
              },
            },
            { $count: 'count' },
          ],
          failed24h: [
            {
              $match: {
                eventType: 'LOGIN_FAILED',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
              },
            },
            { $count: 'count' },
          ],
          replaced24h: [
            {
              $match: {
                eventType: 'SESSION_REPLACED',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]),
  ]);

  const kpis = {
    successfulLogins24h: stats[0]?.success24h[0]?.count || 0,
    failedAttempts24h: stats[0]?.failed24h[0]?.count || 0,
    sessionsReplaced24h: stats[0]?.replaced24h[0]?.count || 0,
  };

  return {
    kpis,
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};
