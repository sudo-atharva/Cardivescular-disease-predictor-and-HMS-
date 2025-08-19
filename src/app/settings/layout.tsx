import DashboardLayout from '@/app/dashboard-layout';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A bit of a hack to determine user type, in a real app this would come from session
  const userType = typeof window !== 'undefined' && window.location.pathname.startsWith('/doctor') ? 'doctor' : 'patient';
  return <DashboardLayout userType={userType}>{children}</DashboardLayout>;
}
