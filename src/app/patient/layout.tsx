/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/
import DashboardLayout from '@/app/dashboard-layout';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout userType="patient">{children}</DashboardLayout>;
}
