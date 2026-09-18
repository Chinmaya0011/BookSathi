import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Support & Help Center — BookSaathi',
  description: 'Need help with your appointment, booking link, UPI payments, or live queue? Contact BookSaathi support or raise a grievance ticket.',
  path: '/support',
  keywords: [
    'BookSaathi support',
    'customer helpdesk appointment booking',
    'refund grievance booking',
    'contact BookSaathi',
  ],
});

export default function SupportLayout({ children }) {
  return <>{children}</>;
}
