
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { FacultyRightSidebar } from '@/components/layout/faculty-right-sidebar';
import Header from '@/components/layout/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted/40 dark:from-slate-900 dark:to-slate-800/60">
      <SidebarNav />
      <div className="flex-1 md:ml-64">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <FacultyRightSidebar />
    </div>
  );
}
