
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { FacultyRightSidebar } from '@/components/layout/faculty-right-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <div className="flex-1 md:ml-64 md:mr-20">
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <FacultyRightSidebar />
    </div>
  );
}
