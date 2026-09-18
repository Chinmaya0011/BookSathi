import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Set Up Your Practice — BookSaathi Onboarding',
  description: 'Complete your professional profile, configure working hours, and generate your custom WhatsApp booking link.',
  path: '/onboarding',
  noIndex: true,
});

export default function OnboardingLayout({ children }) {
  return <>{children}</>;
}
