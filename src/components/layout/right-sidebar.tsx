'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  Sparkles,
  HelpCircle,
  Moon,
  Sun,
  Eye,
  Ear,
  Hand,
  BookOpen,
  Brain,
  Settings,
  LogOut,
  FilePlus,
  BarChart,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useChatbot } from '../chatbot/chatbot-provider';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { useAccessibilityPanel } from '../accessibility/accessibility-panel-provider';
import { accessibilityModules } from '../accessibility/modules';


const notifications = [
    {
        id: '1',
        type: 'exam',
        title: 'New Exam Posted',
        description: 'Dr. Reed posted "Mid-Term Algebra II".',
        timestamp: '5m ago',
        read: false,
    },
    {
        id: '2',
        type: 'result',
        title: 'Results Released',
        description: 'Your score for "Physics Quiz 1" is 88%.',
        timestamp: '1h ago',
        read: false,
    },
    {
        id: '3',
        type: 'exam',
        title: 'Upcoming Deadline',
        description: '"History Chapter 5" exam is due tomorrow.',
        timestamp: '1d ago',
        read: true,
    }
]

export function RightSidebar() {
  const { setTheme, theme } = useTheme();
  const { setIsOpen: setIsChatbotOpen } = useChatbot();
  const { setOpenModule } = useAccessibilityPanel();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
    router.push('/');
  };
  
  const userName = user?.displayName || 'Student';
  const userInitial = userName.split(' ').map(n => n[0]).join('') || 'U';
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <aside className="fixed right-0 top-0 h-full w-20 bg-card/80 border-l border-border/80 flex flex-col items-center justify-between py-6 z-40">
      <div className="flex flex-col items-center gap-6">
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                    {isUserLoading ? (
                        <Skeleton className="h-12 w-12 rounded-full" />
                    ) : (
                        <Avatar className="h-12 w-12 cursor-pointer border-2 border-primary/50 hover:ring-2 hover:ring-primary transition-all">
                            <AvatarImage src={user?.photoURL || ''} alt={userName} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                    )}
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent side="left" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => router.push('/settings/accessibility')}>
                <Brain className="mr-2 h-4 w-4" />
                <span>All Accessibility</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-8 h-px bg-border my-2"></div>

        <DropdownMenu>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                             <div className="relative p-3 rounded-full hover:bg-muted transition-colors cursor-pointer">
                                <Bell className="h-6 w-6 text-muted-foreground" />
                                {unreadCount > 0 && (
                                    <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center border-2 border-card">
                                        {unreadCount}
                                    </div>
                                )}
                            </div>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Notifications</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent side="left" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {notifications.map((notification) => {
                     const Icon = notification.type === 'exam' ? FilePlus : BarChart;
                     return (
                        <DropdownMenuItem key={notification.id} className={`flex items-start gap-3 ${!notification.read && 'font-bold'}`}>
                            <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm leading-tight">{notification.title}</p>
                                <p className={`text-xs text-muted-foreground ${!notification.read && 'font-normal'}`}>{notification.description}</p>
                                <p className="text-xs text-muted-foreground/80 mt-1">{notification.timestamp}</p>
                            </div>
                        </DropdownMenuItem>
                     )
                 })}
            </DropdownMenuContent>
        </DropdownMenu>
        
        <TooltipProvider>
             <Tooltip>
                <TooltipTrigger onClick={() => setIsChatbotOpen((prev) => !prev)}>
                     <div className="p-3 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                        <Sparkles className="h-6 w-6 text-blue-500" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left"><p>AI Assistant</p></TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/help">
                    <div className="p-3 rounded-full hover:bg-muted transition-colors">
                        <HelpCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Help & Guidance</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>

      </div>
      
      <div className="flex-grow w-full flex justify-center items-center">
        <div className="w-px h-full bg-border/50 rounded-full" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <TooltipProvider>
          {accessibilityModules.map((module) => {
            const Icon = module.icon;
            return (
              <Tooltip key={module.id}>
                <TooltipTrigger onClick={() => setOpenModule(module.id)}>
                   <div className="p-2 rounded-full hover:bg-muted transition-colors">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                   </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{module.title} Settings</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>

        <div className="w-8 h-px bg-border my-2"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
               <div className="p-3 rounded-full hover:bg-muted transition-colors">
                 <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
                 <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
                 <span className="sr-only">Toggle theme</span>
               </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Toggle Theme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
