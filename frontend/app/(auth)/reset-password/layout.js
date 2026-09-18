import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Set New Password — BookSaathi',
  description: 'Update your BookSaathi password securely.',
  path: '/reset-password',
  noIndex: true,
});

export default function ResetPasswordLayout({ children }) {
  return <>{children}</>;
}
