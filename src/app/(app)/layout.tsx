import AppLayoutProvider from '@/components/layout/app-layout-provider';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import Header from '@/components/layout/header';
import { RightSidebar } from '@/components/layout/right-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayoutProvider>
        <div className="flex min-h-screen bg-background">
            <SidebarNav />
            <div className="flex-1 md:ml-64 md:mr-16">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
            <RightSidebar />
        </div>
    </AppLayoutProvider>
  );
}
