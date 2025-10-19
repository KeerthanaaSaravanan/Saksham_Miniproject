'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  UserCheck,
  Settings,
  Shield,
  School,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from '@/components/ui/sidebar';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assessment', label: 'Assessments', icon: FileText },
  { href: '/profiling', label: 'My Profile', icon: UserCheck },
];

const adminItems = [
    { href: '/admin/dashboard', label: 'Admin Portal', icon: Shield },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <School className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold font-headline">Saksham</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                >
                    <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                {adminItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={{ children: item.label }}
                    >
                        <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/settings'}
                        tooltip={{ children: 'Settings' }}
                    >
                        <Link href="#">
                        <Settings />
                        <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
