import DashboardLayout from '@/app/dashboard-layout';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A bit of a hack to determine user type, in a real app this would come from session
  const userType = 'doctor';
  return <DashboardLayout userType={userType}>{children}</DashboardLayout>;
}
