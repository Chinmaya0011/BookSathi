import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Track Appointment & Live Token Status — BookSaathi',
  description: 'Instantly check your booking status, live token position in queue, download appointment receipts, and manage your consultation with your phone number or booking code.',
  path: '/lookup',
  keywords: [
    'track appointment India',
    'check token status',
    'live doctor queue status',
    'find booking receipt',
    'BookSaathi lookup',
  ],
});

export default function LookupLayout({ children }) {
  return <>{children}</>;
}
