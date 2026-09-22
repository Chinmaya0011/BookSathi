import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Find Booking & Download Digital Token Pass | BookSaathi',
  description:
    'Look up your confirmed appointment details, active live queue token number, doctor chamber location, and WhatsApp slip using your mobile number.',
  path: '/lookup',
  keywords: [
    'find appointment pass',
    'lookup token number',
    'doctor clinic appointment status',
    'BookSaathi live pass',
  ],
});

export default function LookupLayout({ children }) {
  return children;
}
