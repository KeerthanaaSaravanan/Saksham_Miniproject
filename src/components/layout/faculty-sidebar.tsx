
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Users,
  BarChart3,
  Upload,
  Settings,
  LogOut,
  Brain,
  HelpCircle
} from "lucide-react";
import { useAuth } from '@/firebase';
import { User } from 'firebase/auth';

export default function FacultySidebar({ faculty }: { faculty?: User | null }) {
  const pathname = usePathname();
  const auth = useAuth();

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: Upload,
      label: "Upload Papers",
      href: "/admin/upload"
    },
    {
      icon: FileText,
      label: "Examinations",
      href: "/admin/examinations"
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/admin/analytics"
    },
  ];

  const bottomItems = [
    {
      icon: HelpCircle,
      label: "Help & Guidance",
      href: "/help"
    },
    {
      icon: Settings,
      label: "Profile Settings",
      href: "/admin/settings/profile"
    }
  ];

  const handleSignOut = () => {
    if(auth) {
      auth.signOut();
    }
  };

  return (
    <div className="w-64 bg-slate-900/80 backdrop-blur-md text-white flex-col fixed left-0 top-0 h-full font-inter md:flex hidden transition-colors duration-200 border-r border-slate-700/60"
      style={{
        paddingTop: "32px",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingBottom: "28px",
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
              Faculty Portal
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
                <span className={`font-inter text-[13px] ${
                  isActive 
                    ? 'font-medium text-white' 
                    : 'font-normal text-white/60 group-hover:text-white/80 transition-opacity'
                }`}>
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
             const isActive = pathname.startsWith(item.href);
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
                  className={`text-white/60 mr-3 group-hover:text-white/80 transition-opacity  ${
                    isActive ? 'text-white' : ''
                  }`}
                />
                <span className={`font-inter font-normal text-[12px] text-white/60 group-hover:text-white/80 transition-opacity  ${
                    isActive ? 'text-white' : ''
                  }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <Link
            href="/"
            onClick={handleSignOut}
            className="flex items-center px-2 py-3 rounded-md cursor-pointer hover:bg-slate-800 active:bg-slate-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary"
            tabIndex={0}
          >
            <LogOut size={18} className="text-white/60" />
            <span className="font-inter font-medium text-[12px] text-white/60 ml-3">
              Sign Out
            </span>
          </Link>
        </div>
        
        {faculty && (
           <div className="mt-6 flex items-center">
             <div className="flex-1">
               <p className="text-sm font-semibold text-white">{faculty.displayName}</p>
               <p className="text-xs text-white/60">{faculty.email}</p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
