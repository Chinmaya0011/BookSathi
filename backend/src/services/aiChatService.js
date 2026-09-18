import { retrieveDatabaseDataForQuery } from './aiDataRetriever.js';
import { generateAiResponse } from './geminiService.js';

/**
 * Standard Action mapping to Frontend URLs
 */
export const ACTION_URL_MAP = {
  VIEW_APPOINTMENTS: {
    USER: '/dashboard/appointments',
    PROFESSIONAL: '/dashboard/appointments',
    ADMIN: '/admin/appointments',
    GUEST: '/lookup',
  },
  BOOK_APPOINTMENT: {
    USER: '/dashboard/find',
    PROFESSIONAL: '/dashboard/appointments',
    ADMIN: '/admin/appointments',
    GUEST: '/lookup',
  },
  VIEW_QUEUE: {
    USER: '/dashboard/appointments',
    PROFESSIONAL: '/dashboard/appointments',
    ADMIN: '/admin/appointments',
    GUEST: '/lookup',
  },
  VIEW_SERVICES: {
    USER: '/dashboard/find',
    PROFESSIONAL: '/dashboard/services',
    ADMIN: '/admin',
    GUEST: '/lookup',
  },
  VIEW_ANALYTICS: {
    USER: '/dashboard',
    PROFESSIONAL: '/dashboard',
    ADMIN: '/admin',
    GUEST: '/dashboard',
  },
  VIEW_PROFILE: {
    USER: '/dashboard/profile',
    PROFESSIONAL: '/dashboard/profile',
    ADMIN: '/admin',
    GUEST: '/lookup',
  },
  MANAGE_AVAILABILITY: {
    USER: '/dashboard',
    PROFESSIONAL: '/dashboard/availability',
    ADMIN: '/admin',
    GUEST: '/dashboard',
  },
  VIEW_MESSAGES: {
    USER: '/dashboard/messages',
    PROFESSIONAL: '/dashboard/messages',
    ADMIN: '/admin/messages',
    GUEST: '/login',
  },
  UPGRADE_PRO: {
    USER: '/dashboard',
    PROFESSIONAL: '/dashboard/subscription',
    ADMIN: '/admin',
    GUEST: '/login',
  },
};

export const aiChatService = {
  /**
   * Generate intelligent AI bot response tailored directly by user role, live DB context, and structured schema
   */
  processQuery: async ({
    role = 'GUEST',
    user = null,
    profile = null,
    message = '',
    context = {},
    history = [],
  }) => {
    const text = (message || '').trim();
    if (!text) {
      return {
        message: 'Please ask a question or select one of the suggested topics below.',
        reply: 'Please ask a question or select one of the suggested topics below.',
        sections: [],
        quickPrompts: getRoleQuickPrompts(role),
        quickActions: [],
        databaseUsed: false,
      };
    }

    try {
      // 1. Fetch minimal relevant database data matching user role and question intent
      const dbRetrieval = await retrieveDatabaseDataForQuery({
        user,
        profile,
        role,
        message: text,
      });

      // 2. Handle unauthorized query attempts securely
      if (dbRetrieval.isUnauthorized) {
        const unauthReply = "I can't access that information because you don't have permission to view it.";
        return {
          message: unauthReply,
          reply: unauthReply,
          sections: [
            {
              type: 'warning',
              title: 'Access Restricted',
              content: 'You do not have permission to view global platform metrics or other users’ private data.',
            },
          ],
          quickPrompts: getRoleQuickPrompts(role),
          quickActions: [],
          databaseUsed: false,
        };
      }

      // 3. Handle Guest requesting private authenticated actions
      if (dbRetrieval.requiresAuth) {
        const authReply = 'Please log in to your BookSaathi account to view and manage personal bookings and practice schedules.';
        return {
          message: authReply,
          reply: authReply,
          sections: [],
          quickPrompts: getRoleQuickPrompts('GUEST'),
          quickActions: [
            { label: 'Login to Account', action: 'LOGIN', href: '/login' },
            { label: 'Register Free', action: 'REGISTER', href: '/register' },
          ],
          databaseUsed: false,
        };
      }

      // 4. Send relevant database data and conversation context to Gemini (or local structured synthesizer)
      const conversationHistory = history || context?.history || [];

      const aiResult = await generateAiResponse({
        userMessage: text,
        databaseContext: dbRetrieval.contextText,
        conversationHistory,
        userRole: role,
        structuredData: dbRetrieval.structuredData,
      });

      // 5. Build dynamic follow-up prompts and resolve action links
      const quickPrompts = getDynamicPrompts(role, text);
      const rawActions = (aiResult.quickActions && aiResult.quickActions.length > 0)
        ? aiResult.quickActions
        : (dbRetrieval.quickActions && dbRetrieval.quickActions.length > 0)
        ? dbRetrieval.quickActions
        : getDynamicActions(role, text);

      // Resolve hrefs safely
      const quickActions = rawActions.map((act) => {
        let href = act.href;
        if (!href && act.action && ACTION_URL_MAP[act.action]) {
          href = ACTION_URL_MAP[act.action][role] || ACTION_URL_MAP[act.action]['USER'] || '/dashboard';
        }
        return {
          label: act.label,
          action: act.action || 'NAVIGATE',
          href: href || '/dashboard',
        };
      });

      // 6. Build backward-compatible flat markdown string for older callers
      const flatReply = buildFlatMarkdownFromStructured(aiResult);

      return {
        message: aiResult.message || flatReply,
        reply: flatReply,
        sections: aiResult.sections || [],
        quickPrompts,
        quickActions,
        databaseUsed: dbRetrieval.hasData,
      };
    } catch (error) {
      console.error('Error processing AI Chat Query:', error);
      const errReply = `I ran into an unexpected issue while processing your request. Please try again or navigate using your dashboard.`;
      return {
        message: errReply,
        reply: errReply,
        sections: [
          {
            type: 'error',
            title: 'Processing Notice',
            content: 'Could not complete the query. Please retry in a moment.',
          },
        ],
        quickPrompts: getRoleQuickPrompts(role),
        quickActions: [{ label: 'Dashboard Home', action: 'VIEW_ANALYTICS', href: '/dashboard' }],
        databaseUsed: false,
      };
    }
  },
};

/**
 * Builds clean flat markdown text from structured response for legacy callers
 */
function buildFlatMarkdownFromStructured(aiResult) {
  if (!aiResult) return '';
  let parts = [];
  if (aiResult.message) parts.push(aiResult.message);

  if (Array.isArray(aiResult.sections)) {
    aiResult.sections.forEach((sec) => {
      if (sec.title && !aiResult.message?.includes(sec.title)) parts.push(`\n### ${sec.title}`);
      if (sec.content && !aiResult.message?.includes(sec.content)) parts.push(sec.content);

      if (sec.type === 'appointments' && Array.isArray(sec.items)) {
        sec.items.forEach((item, idx) => {
          parts.push(
            `\n**${idx + 1}. ${item.time || 'Time'}** | ${item.professional || item.client || 'Specialist'} | *${item.service || 'Consultation'}* | Status: **${item.status || 'Confirmed'}**${item.token ? ` (Token #${item.token})` : ''}`
          );
        });
      } else if (sec.type === 'professionals' && Array.isArray(sec.items)) {
        sec.items.forEach((pro) => {
          parts.push(`- **${pro.name}** (${pro.profession} - ${pro.specialization}) in ${pro.city} | Fee: ${pro.fee} | ⭐ ${pro.rating || '4.8'}`);
        });
      } else if (sec.type === 'statistics' && (sec.data?.stats || sec.stats)) {
        const statsList = sec.data?.stats || sec.stats || [];
        statsList.forEach((s) => {
          parts.push(`- **${s.label}:** ${s.value}`);
        });
      } else if (sec.type === 'queue' && (sec.data || sec.currentServingToken !== undefined)) {
        const q = sec.data || sec;
        parts.push(`- **Current Serving Token:** #${q.currentServingToken || 'None'}\n- **Waiting Patients:** ${q.waitingCount || 0}\n- **Next Token:** #${q.nextToken || 'None'}`);
      } else if (sec.type === 'availability' && Array.isArray(sec.items)) {
        sec.items.forEach((item) => {
          parts.push(`- **${item.day}:** ${item.enabled ? `Available (${item.hours})` : 'Closed'}`);
        });
      } else if (sec.type === 'services' && Array.isArray(sec.items)) {
        sec.items.forEach((s) => {
          parts.push(`- **${s.name}:** ${s.fee} (${s.duration || ''}) - *${s.status || 'Active'}*`);
        });
      }
    });
  }

  return parts.join('\n\n').trim();
}

/**
 * Return default quick prompts per role
 */
function getRoleQuickPrompts(role) {
  if (role === 'USER') {
    return [
      '📅 What appointments do I have tomorrow?',
      '🩺 Who is my next appointment with?',
      '📊 How many appointments do I have this month?',
      '💳 Refund & Cancellation policy',
    ];
  }
  if (role === 'PROFESSIONAL') {
    return [
      '📋 How many bookings do I have today?',
      '📅 Show my upcoming appointments',
      '⏰ What is my weekly availability?',
      '📈 How many appointments completed this week?',
    ];
  }
  if (role === 'ADMIN') {
    return [
      '📊 Give me a summary of platform activity',
      '👥 How many users are registered?',
      '📅 How many bookings were created this month?',
      '🛡️ Review pending grievances',
    ];
  }
  return [
    '🔍 How does booking work?',
    '💼 How do I register as a Professional?',
    '🩺 Find a Doctor or CA in Bhubaneswar',
  ];
}

/**
 * Generate contextual follow-up prompts
 */
function getDynamicPrompts(role, message) {
  const lower = (message || '').toLowerCase();

  if (role === 'USER') {
    if (lower.includes('appointment') || lower.includes('booking') || lower.includes('tomorrow') || lower.includes('today')) {
      return [
        'Who is my next doctor?',
        'How many appointments this month?',
        'Show my cancelled bookings',
      ];
    }
    return [
      'What appointments do I have tomorrow?',
      'How do I reschedule?',
      'Explore Doctors in Bhubaneswar',
    ];
  }

  if (role === 'PROFESSIONAL') {
    if (lower.includes('today') || lower.includes('queue') || lower.includes('token')) {
      return [
        'Show upcoming consultations',
        'How many completed this week?',
        'Check my weekly working hours',
      ];
    }
    return [
      'How many bookings today?',
      'What are my service tariffs?',
      "What's today's live queue?",
    ];
  }

  if (role === 'ADMIN') {
    return [
      'Platform activity overview',
      'Total registered users',
      'Monthly bookings count',
    ];
  }

  return [
    'How does booking work?',
    'Register as a Doctor or CA',
    'Find a Doctor in Bhubaneswar',
  ];
}

/**
 * Optional navigation action buttons
 */
function getDynamicActions(role, message) {
  const lower = (message || '').toLowerCase();
  const actions = [];

  if (role === 'USER') {
    if (lower.includes('appointment') || lower.includes('booking') || lower.includes('reschedule') || lower.includes('tomorrow') || lower.includes('today')) {
      actions.push({ label: 'View Appointments', action: 'VIEW_APPOINTMENTS', href: '/dashboard/appointments' });
    }
    if (lower.includes('doctor') || lower.includes('find') || lower.includes('ca') || lower.includes('search')) {
      actions.push({ label: 'Find Professionals', action: 'BOOK_APPOINTMENT', href: '/dashboard/find' });
    }
  } else if (role === 'PROFESSIONAL') {
    if (lower.includes('queue') || lower.includes('token') || lower.includes('serving')) {
      actions.push({ label: 'Manage Live Queue', action: 'VIEW_QUEUE', href: '/dashboard/appointments' });
    }
    if (lower.includes('slot') || lower.includes('availability') || lower.includes('timing')) {
      actions.push({ label: 'Configure Availability', action: 'MANAGE_AVAILABILITY', href: '/dashboard/availability' });
    }
    if (lower.includes('service') || lower.includes('price') || lower.includes('tariff')) {
      actions.push({ label: 'Manage Services', action: 'VIEW_SERVICES', href: '/dashboard/services' });
    }
  } else if (role === 'ADMIN') {
    actions.push({ label: 'Command Center', action: 'VIEW_ANALYTICS', href: '/admin' });
  }

  return actions;
}
