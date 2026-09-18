import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Dashboard — BookSaathi Practice & Schedule Management',
  description: 'Manage your appointments, live token queues, patient records, payment earnings, and availability schedules.',
  path: '/dashboard',
  noIndex: true,
});

export default function DashboardRootLayout({ children }) {
  return <>{children}</>;
}
