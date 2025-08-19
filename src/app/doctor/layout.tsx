import DashboardLayout from '@/app/dashboard-layout';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout userType="doctor">{children}</DashboardLayout>;
}
