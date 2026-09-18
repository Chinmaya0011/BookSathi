import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Authentication — BookSaathi',
  description: 'Sign in or create your BookSaathi account to manage schedules, appointments, and live patient queues.',
  path: '/login',
});

export default function AuthLayout({ children }) {
  return <>{children}</>;
}
