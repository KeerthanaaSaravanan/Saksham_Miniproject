
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Brain,
  Zap,
  HelpCircle,
  Info,
  Route,
} from 'lucide-react';
import { useExamMode } from '@/hooks/use-exam-mode';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';


export default function StudentSidebar({ student }: { student?: any }) {
  const pathname = usePathname();
  const { isExamMode } = useExamMode();
  const auth = useAuth();
  
  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: BookOpen,
      label: 'My Exams',
      href: '/assessment',
    },
    {
      icon: Zap,
      label: 'Practice',
      href: '/practice',
    },
    {
      icon: FileText,
      label: 'Results',
      href: '/results',
    },
  ];

  const bottomItems = [
    {
      icon: Settings,
      label: 'Profile Settings',
      href: '/settings/profile',
    },
    {
      icon: Brain,
      label: 'Accessibility Settings',
      href: '/settings/accessibility',
    },
    {
      icon: HelpCircle,
      label: 'Help & Guidance',
      href: '/help',
    },
    {
      icon: Route,
      label: 'Application Flow',
      href: '/flow',
    },
  ];

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
  };
  
  if (isExamMode) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-64 bg-slate-900/80 backdrop-blur-md text-white flex-col fixed left-0 top-0 h-full font-inter md:flex hidden transition-opacity duration-300 border-r border-slate-700/60",
        isExamMode ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{
        paddingTop: '32px',
        paddingLeft: '24px',
        paddingRight: '24px',
        paddingBottom: '28px',
      }}
    >
      {/* Brand Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-poppins font-bold text-lg text-white">
              SAKSHAM
            </h1>
            <p className="font-inter text-xs text-white opacity-60">
              Student Portal
            </p>
          </div>
        </div>
      </div>

      {/* Main Menu Section */}
      <div className="flex-1">
        <h2 className="font-inter font-semibold text-[11px] text-white mb-3 opacity-60">
          MAIN MENU
        </h2>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center rounded-md px-4 py-3 transition-colors duration-150 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
                  isActive
                    ? 'bg-primary hover:bg-primary/90'
                    : 'hover:bg-white/10 active:bg-white/15'
                } group`}
                tabIndex={0}
              >
                <IconComponent
                  size={18}
                  className={`mr-4 ${
                    isActive
                      ? 'text-white'
                      : 'text-white/60 group-hover:text-white/80 transition-opacity'
                  }`}
                />
                <span
                  className={`font-inter text-[13px] ${
                    isActive
                      ? 'font-medium text-white'
                      : 'font-normal text-white/60 group-hover:text-white/80 transition-opacity'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto">
        <hr className="border-white/10 border-t mb-6" />
        <div className="space-y-2">
          {bottomItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-2 group ${
                  isActive ? 'bg-primary/20' : ''
                }`}
                tabIndex={0}
              >
                <IconComponent
                  size={18}
                  className={`text-white/60 mr-3 group-hover:text-white/80 transition-opacity ${
                    isActive ? 'text-white' : ''
                  }`}
                />
                <span
                  className={`font-inter font-normal text-[12px] text-white/60 group-hover:text-white/80 transition-opacity ${
                    isActive ? 'text-white' : ''
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
            <Link
                href="/"
                onClick={handleSignOut}
                key="signout"
                className={`flex items-center cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-2 group`}
                tabIndex={0}
              >
                <LogOut
                  size={18}
                  className={`text-white/60 mr-3 group-hover:text-white/80 transition-opacity`}
                />
                <span
                  className={`font-inter font-normal text-[12px] text-white/60 group-hover:text-white/80 transition-opacity`}
                >
                  Sign Out
                </span>
              </Link>
        </div>
      </div>
    </div>
  );
}
