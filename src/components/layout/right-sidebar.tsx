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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useChatbot } from '../chatbot/chatbot-provider';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';

const accessibilityFeatures = [
  { icon: Eye, label: 'Visual', href: '/settings/accessibility' },
  { icon: Ear, label: 'Hearing', href: '/settings/accessibility' },
  { icon: Hand, label: 'Motor', href: '/settings/accessibility' },
  { icon: BookOpen, label: 'Learning', href: '/settings/accessibility' },
  { icon: Brain, label: 'Cognitive', href: '/settings/accessibility' },
];

export function RightSidebar() {
  const { setTheme, theme } = useTheme();
  const { setIsOpen } = useChatbot();
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-8 h-px bg-border my-2"></div>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <div className="p-3 rounded-full hover:bg-muted transition-colors">
                        <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Notifications</p></TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger onClick={() => setIsOpen((prev) => !prev)}>
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
          {accessibilityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Tooltip key={feature.label}>
                <TooltipTrigger asChild>
                  <Link href={feature.href}>
                     <div className="p-2 rounded-full hover:bg-muted transition-colors">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                     </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{feature.label} Accessibility</p>
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
