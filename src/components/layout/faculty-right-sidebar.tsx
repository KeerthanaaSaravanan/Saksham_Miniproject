
'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bot,
  Bell,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

export function FacultyRightSidebar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
    router.push('/');
  };

  const userName = user?.displayName || 'Faculty';
  const userInitial =
    userName
      .split(' ')
      .map((n) => n[0])
      .join('') || 'F';

  return (
    <aside className="fixed right-0 top-0 h-full w-20 bg-card/80 border-l border-border/80 flex flex-col items-center justify-between py-6 z-40">
      {/* Top Section: Profile */}
      <div className="flex flex-col items-center">
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    {isUserLoading ? (
                      <Skeleton className="h-10 w-10 rounded-full" />
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.photoURL ?? undefined} alt={userName} />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>My Account</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent side="left" className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/admin/settings/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Middle Section: Utilities */}
      <div className="flex flex-col items-center gap-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger onClick={() => { /* TODO: Implement notification logic */ }}>
                    <div className='p-3 rounded-full transition-colors cursor-pointer hover:bg-muted'>
                        <Bell className='h-6 w-6 text-muted-foreground' />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Notify a Student</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger onClick={() => { /* TODO: Implement chatbot logic */ }}>
                    <div className='p-3 rounded-full transition-colors cursor-pointer hover:bg-muted'>
                        <Bot className='h-6 w-6 text-muted-foreground' />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>AI Assistant</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>

       {/* Bottom Section: Theme */}
      <div className="flex flex-col items-center gap-2">
         <TooltipProvider>
            {theme === 'dark' ? (
                <Tooltip>
                    <TooltipTrigger onClick={() => setTheme('light')}>
                        <div className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
                            <Sun className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Light Mode</p></TooltipContent>
                </Tooltip>
            ) : (
                <Tooltip>
                    <TooltipTrigger onClick={() => setTheme('dark')}>
                        <div className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
                            <Moon className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Dark Mode</p></TooltipContent>
                </Tooltip>
            )}
        </TooltipProvider>
      </div>
    </aside>
  );
}
