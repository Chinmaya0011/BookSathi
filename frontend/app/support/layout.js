import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Customer Support & Practice Help Desk | BookSaathi',
  description:
    'Need assistance with your booking, payment confirmation, live token queue, or practice setup? Submit a support ticket or grievance for 24-hour resolution.',
  path: '/support',
  keywords: [
    'BookSaathi support',
    'appointment help',
    'booking customer care',
    'clinic scheduling support',
  ],
});

export default function SupportLayout({ children }) {
  return children;
}
