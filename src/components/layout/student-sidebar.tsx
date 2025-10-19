'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  FileText,
  Award,
  Settings,
  BarChart3,
  HelpCircle,
  LogOut,
  Brain,
  ChevronDown,
  Clock
} from "lucide-react";

export default function StudentSidebar({ student }: { student?: any}) {
  const pathname = usePathname();
  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: BookOpen,
      label: "My Exams",
      href: "/assessment",
    },
    {
      icon: FileText,
      label: "Results",
      href: "#"
    }
  ];

  const bottomItems = [
    {
      icon: Settings,
      label: "Accessibility Settings",
      href: "/settings/accessibility"
    }
  ];

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
      <div className="mb-6">
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

      {/* Profile Section */}
      {student && (
        <div className="flex items-center mb-7 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors duration-200">
          <img
            src={student.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&h=40&q=80"}
            alt={student.name}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div className="flex-1">
            <div className="font-inter font-semibold text-[13px] text-white">
              {student.name}
            </div>
            <div className="font-inter font-normal text-[11px] text-white opacity-50">
              Class {student.class} • {student.stream}
            </div>
          </div>
          <ChevronDown
            size={18}
            className="text-white opacity-60 hover:opacity-80 transition-opacity"
          />
        </div>
      )}

      {/* Main Menu Section */}
      <div className="mb-9 flex-1">
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

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="font-inter font-semibold text-[11px] text-white mb-3 opacity-60">
          QUICK ACCESS
        </h2>
        <div className="space-y-2">
          <div className="flex items-center px-3 py-2 bg-primary/20 rounded-lg cursor-pointer hover:bg-primary/30 transition-colors">
            <Clock size={16} className="text-primary mr-3" />
            <div className="flex-1">
              <div className="font-inter text-[12px] text-white font-medium">Next Exam</div>
              <div className="font-inter text-[10px] text-white opacity-70">Mathematics - 2 hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto">
        <hr className="border-white/10 border-t mb-6" />
        <div className="space-y-2">
          {bottomItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                href={item.href}
                key={item.label}
                className="flex items-center cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-2 group"
                tabIndex={0}
              >
                <IconComponent
                  size={18}
                  className="text-white/60 mr-3 group-hover:text-white/80 transition-opacity"
                />
                <span className="font-inter font-normal text-[12px] text-white/60 group-hover:text-white/80 transition-opacity">
                  {item.label}
                </span>
              </Link>
            );
          })}

          <Link
            href="/"
            className="flex items-center px-2 py-3 rounded-md cursor-pointer hover:bg-slate-800 active:bg-slate-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary"
            tabIndex={0}
          >
            <LogOut size={18} className="text-white mr-3" />
            <span className="font-inter font-medium text-[12px] text-white">
              Sign Out
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
