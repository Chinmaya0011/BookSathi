export const aiChatService = {
  /**
   * Generate intelligent AI bot response tailored directly by user role
   */
  processQuery: async ({ role = 'GUEST', message, context = {} }) => {
    const text = (message || '').trim();
    const lower = text.toLowerCase();

    // 1. CUSTOMER / USER AI BOT
    if (role === 'USER') {
      if (lower.includes('reschedule') || lower.includes('change time') || lower.includes('postpone')) {
        return {
          reply: 'To reschedule your consultation: Go to the "Appointments" tab in your dashboard, locate the appointment under "Upcoming", and click "Request Reschedule" to pick a new date and time slot.',
          quickActions: [
            { label: 'View My Appointments', href: '/dashboard/appointments' },
            { label: 'Find Professionals', href: '/dashboard/find' },
          ],
        };
      }

      if (lower.includes('cancel') || lower.includes('refund') || lower.includes('money')) {
        return {
          reply: 'You can cancel any booking up to 2 hours before the scheduled time directly from your Appointments dashboard. Refunds for prepaid consultations are initiated immediately and credited to your original payment method in 3-5 business days.',
          quickActions: [
            { label: 'My Appointments', href: '/dashboard/appointments' },
            { label: 'Contact Support', action: 'open_support_chat' },
          ],
        };
      }

      if (lower.includes('doctor') || lower.includes('ca') || lower.includes('lawyer') || lower.includes('find') || lower.includes('book')) {
        return {
          reply: 'You can discover verified Doctors, Chartered Accountants, Legal Advisors, and Consultants in your city under the "Find Professionals" directory with instant calendar availability.',
          quickActions: [
            { label: 'Explore Directory', href: '/dashboard/find' },
          ],
        };
      }

      if (lower.includes('contact') || lower.includes('talk to doctor') || lower.includes('chat with pro')) {
        return {
          reply: 'You can chat directly with any doctor or professional you have booked with using the "Live Conversations" tab above, or chat with BookSaathi Admin Support anytime!',
          quickActions: [
            { label: 'Switch to Live Chat', action: 'switch_live_tab' },
          ],
        };
      }

      return {
        reply: `Hello! I'm your BookSaathi Patient & Client AI Guide. I can help you schedule consultations, find certified specialists in India, understand cancellation terms, or navigate your appointments. What would you like assistance with?`,
        quickPrompts: ['📅 How to reschedule?', '🩺 Find a Doctor or CA', '💳 Refund & Cancellation policy'],
      };
    }

    // 2. PROFESSIONAL AI BOT
    if (role === 'PROFESSIONAL') {
      if (lower.includes('slot') || lower.includes('availability') || lower.includes('working hours') || lower.includes('schedule')) {
        return {
          reply: 'You can configure your weekly working days, morning/evening slots, break times, and consultation durations from the "Availability" section in your sidebar.',
          quickActions: [
            { label: 'Configure Availability', href: '/dashboard/availability' },
            { label: 'Block Dates / Leaves', href: '/dashboard/blocked-dates' },
          ],
        };
      }

      if (lower.includes('qr') || lower.includes('standee') || lower.includes('reception') || lower.includes('kit')) {
        return {
          reply: 'You can download your customized Clinic/Office QR Standee Banner from your dashboard or order a physical acrylic desk kit with doorstep shipping across India!',
          quickActions: [
            { label: 'Download QR Banner', href: '/dashboard/qr-banner' },
          ],
        };
      }

      if (lower.includes('plan') || lower.includes('subscription') || lower.includes('upgrade') || lower.includes('pricing')) {
        return {
          reply: 'BookSaathi offers Starter (Free), Professional (₹999/mo), and Business Growth plans with 0% platform commission on direct UPI client bookings.',
          quickActions: [
            { label: 'Manage Subscription', href: '/dashboard/subscription' },
          ],
        };
      }

      if (lower.includes('chat') || lower.includes('client message') || lower.includes('patient')) {
        return {
          reply: 'You can message clients who have booked an appointment with you via the "Live Conversations" tab, or reach out directly to the BookSaathi Admin Support Desk.',
          quickActions: [
            { label: 'Switch to Live Chat', action: 'switch_live_tab' },
          ],
        };
      }

      return {
        reply: `Namaste Doctor/Consultant! I am your Practice AI Assistant. I can help you set up slot schedules, manage client appointments, order reception QR standees, or optimize your public booking link. How can I assist your practice today?`,
        quickPrompts: ['⏰ Set weekly availability', '🪧 Order Reception QR Standee', '💎 Subscription plans & limits'],
      };
    }

    // 3. ADMIN AI BOT
    if (role === 'ADMIN') {
      if (lower.includes('stat') || lower.includes('metric') || lower.includes('count') || lower.includes('revenue')) {
        return {
          reply: 'You can inspect real-time system metrics, active subscriptions, standee kit shipments, and gross booking volume directly from the Command Center.',
          quickActions: [
            { label: 'Command Center', href: '/admin' },
            { label: 'Financial Ledger', href: '/admin/payments' },
          ],
        };
      }

      if (lower.includes('grievance') || lower.includes('dispute') || lower.includes('support')) {
        return {
          reply: 'Platform disputes and grievances can be prioritized, assigned, and resolved with audit trails in the Support & Grievance console.',
          quickActions: [
            { label: 'Support & Grievances', href: '/admin/grievances' },
          ],
        };
      }

      return {
        reply: `Admin AI Assistant online. I can assist with platform health monitoring, professional verification workflows, grievance triage, or audit log inspections.`,
        quickPrompts: ['📊 Command center metrics', '🛡️ Review pending verifications', '⚖️ Grievance resolution flow'],
      };
    }

    // 4. GUEST / PUBLIC VISITOR AI BOT
    return {
      reply: 'Welcome to BookSaathi! We empower Indian doctors, CAs, lawyers, and consultants with instant online appointment scheduling. How can I assist you today?',
      quickPrompts: ['🔍 How does booking work?', '💼 I want to register as a Professional', '🔐 Is my data secure?'],
    };
  },
};
