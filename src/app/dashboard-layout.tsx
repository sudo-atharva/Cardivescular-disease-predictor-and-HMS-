'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  User,
  LogOut,
  Stethoscope,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DashboardLayoutProps = {
  children: React.ReactNode;
  userType: 'doctor' | 'patient';
};

const doctorNav = [
  { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { name: 'Patients', href: '/doctor/patients', icon: Users },
  { name: 'Reports', href: '/doctor/reports', icon: FileText },
];

const patientNav = [
  { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { name: 'My Reports', href: '/patient/my-reports', icon: FileText },
  { name: 'Vitals History', href: '/patient/vitals-history', icon: Stethoscope },
];

const commonNav = [{ name: 'Settings', href: '/settings', icon: Settings }];

export default function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navigationMenu = userType === 'doctor' ? doctorNav : patientNav;
  const userName = userType === 'doctor' ? 'Dr. Evelyn Reed' : 'John Doe';
  const userEmail = userType === 'doctor' ? 'e.reed@health.io' : 'john.doe@email.com';
  const avatarSrc = userType === 'doctor' ? 'https://placehold.co/100x100' : 'https://placehold.co/100x100';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary p-2 rounded-lg">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold font-headline">HealthLink</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navigationMenu.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.name }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {commonNav.map((item) => (
               <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.name }}
                >
                   <Link href={item.href}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push('/')} tooltip={{ children: 'Logout' }}>
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-background/50 backdrop-blur-sm px-6 sticky top-0 z-10 print:hidden">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold capitalize">{userType} Dashboard</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarSrc} alt={userName} data-ai-hint="person portrait" />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/')}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-6 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
