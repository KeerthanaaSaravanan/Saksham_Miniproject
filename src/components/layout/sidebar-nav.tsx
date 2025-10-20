'use client';

import { usePathname } from 'next/navigation';
import StudentSidebar from '@/components/layout/student-sidebar';
import FacultySidebar from '@/components/layout/faculty-sidebar';

// Mock user data. In a real app, this would come from your auth context.
const student = {
  name: 'Arjun Sharma',
  class: '10',
  stream: 'Science',
  profile_image: 'https://picsum.photos/seed/arjun/40/40'
};

const faculty = {
    name: 'Dr. Evelyn Reed',
    department: 'Science',
    role: 'Professor'
};

export function SidebarNav() {
  const pathname = usePathname();

  // Determine which sidebar to show based on the current path
  if (pathname.startsWith('/admin')) {
    return <FacultySidebar faculty={faculty} />;
  }

  // Default to student sidebar for all other routes under /
  return <StudentSidebar student={student} />;
}
