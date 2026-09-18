import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { constructMetadata } from '@/lib/metadata';

export const metadata = constructMetadata({
  title: 'Admin Command Center — BookSaathi Platform Governance',
  description: 'Super-admin management console for user verification, financial audits, security logs, and global platform configuration.',
  path: '/admin',
  noIndex: true,
});

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
