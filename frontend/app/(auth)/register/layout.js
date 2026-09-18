import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Join BookSaathi — Free Professional & Client Registration',
  description: 'Create your BookSaathi account in 30 seconds. Doctors, CAs, Lawyers, and Consultants can set up custom booking links and live queues instantly.',
  path: '/register',
});

export default function RegisterLayout({ children }) {
  return <>{children}</>;
}
