
'use client';

import { usePathname } from 'next/navigation';
import StudentSidebar from '@/components/layout/student-sidebar';
import FacultySidebar from '@/components/layout/faculty-sidebar';
import { useUser } from '@/firebase';

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();

  // Determine which sidebar to show based on the current path
  if (pathname.startsWith('/admin')) {
    return <FacultySidebar faculty={user} />;
  }

  // Default to student sidebar for all other routes under /
  return <StudentSidebar student={user} />;
}
