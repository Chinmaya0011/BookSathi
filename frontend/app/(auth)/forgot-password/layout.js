import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Forgot Password — Reset Your BookSaathi Credentials',
  description: 'Recover access to your BookSaathi account securely with an email or OTP verification code.',
  path: '/forgot-password',
});

export default function ForgotPasswordLayout({ children }) {
  return <>{children}</>;
}
