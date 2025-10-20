import Header from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 dark:from-[#0B1426] dark:via-[#111B2E] dark:to-[#1A2642]">
      <SidebarNav />
      <div className="flex-1 md:ml-64">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
