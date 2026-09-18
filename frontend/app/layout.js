import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'sonner';
import FloatingChatWidget from '@/components/dashboard/FloatingChatWidget';
import SessionRevokedModal from '@/components/auth/SessionRevokedModal';
import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata();

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <SessionRevokedModal />
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3500}
            theme="light"
          />
          <FloatingChatWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
