import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Sign In — Access Your BookSaathi Account',
  description: 'Log in to your BookSaathi dashboard to manage appointments, live tokens, availability shifts, and client interactions.',
  path: '/login',
});

export default function LoginLayout({ children }) {
  return <>{children}</>;
}
