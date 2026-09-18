import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Client & Patient Sign Up — BookSaathi',
  description: 'Create a free account to track your appointments, download prescriptions/invoices, check live token numbers, and manage bookings.',
  path: '/register/user',
});

export default function UserRegisterLayout({ children }) {
  return <>{children}</>;
}
