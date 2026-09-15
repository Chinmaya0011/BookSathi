import { retrieveDatabaseDataForQuery } from './aiDataRetriever.js';
import { generateAiResponse } from './geminiService.js';

export const aiChatService = {
  /**
   * Generate intelligent AI bot response tailored directly by user role and live DB context
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
        reply: 'Please ask a question or select one of the suggested topics below.',
        quickPrompts: getRoleQuickPrompts(role),
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
        return {
          reply: 'I’m sorry, but you don’t have permission to access that information.',
          quickPrompts: getRoleQuickPrompts(role),
        };
      }

      // 3. Send relevant database data and conversation context to Gemini
      const conversationHistory = history || context?.history || [];

      const markdownReply = await generateAiResponse({
        userMessage: text,
        databaseContext: dbRetrieval.contextText,
        conversationHistory,
        userRole: role,
      });

      // 4. Attach relevant dynamic quick prompts based on role and query
      const quickPrompts = getDynamicPrompts(role, text);
      const quickActions = getDynamicActions(role, text);

      return {
        reply: markdownReply,
        quickPrompts,
        quickActions,
        databaseUsed: dbRetrieval.hasData,
      };
    } catch (error) {
      console.error('Error processing AI Chat Query:', error);
      return {
        reply: `I ran into an unexpected issue while processing your request. Please try again or navigate using your dashboard sidebar.`,
        quickPrompts: getRoleQuickPrompts(role),
      };
    }
  },
};

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
    '🩺 Find a Doctor or CA',
  ];
}

/**
 * Generate contextual follow-up prompts
 */
function getDynamicPrompts(role, message) {
  const lower = message.toLowerCase();

  if (role === 'USER') {
    if (lower.includes('appointment') || lower.includes('booking')) {
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
    if (lower.includes('today') || lower.includes('booking')) {
      return [
        'Show upcoming consultations',
        'How many completed this week?',
        'Check my weekly working hours',
      ];
    }
    return [
      'How many bookings today?',
      'What are my service tariffs?',
      'Order Reception QR Standee',
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
    'Is my consultation data secure?',
  ];
}

/**
 * Optional navigation action buttons
 */
function getDynamicActions(role, message) {
  const lower = message.toLowerCase();
  const actions = [];

  if (role === 'USER') {
    if (lower.includes('appointment') || lower.includes('booking') || lower.includes('reschedule')) {
      actions.push({ label: 'View Appointments', href: '/dashboard/appointments' });
    }
    if (lower.includes('doctor') || lower.includes('find') || lower.includes('ca')) {
      actions.push({ label: 'Find Professionals', href: '/dashboard/find' });
    }
  } else if (role === 'PROFESSIONAL') {
    if (lower.includes('slot') || lower.includes('availability') || lower.includes('timing')) {
      actions.push({ label: 'Configure Availability', href: '/dashboard/availability' });
    }
    if (lower.includes('service') || lower.includes('price') || lower.includes('tariff')) {
      actions.push({ label: 'Manage Services', href: '/dashboard/services' });
    }
  } else if (role === 'ADMIN') {
    actions.push({ label: 'Command Center', href: '/admin' });
  }

  return actions;
}
