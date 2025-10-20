
'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAccessibilityPanel } from '../accessibility/accessibility-panel-provider';
import { accessibilityModules } from '../accessibility/modules';
import {
  Bot,
  Bell,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Mic,
  MicOff,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { useChatbot } from '../chatbot/chatbot-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useExamMode } from '@/hooks/use-exam-mode';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { useVoiceControl } from '../voice-control-provider';

const notifications = [
  {
    title: 'New Exam Posted',
    description: 'Algebra II Mid-Term is now available.',
    time: '5m ago',
  },
  {
    title: 'Results Released',
    description: 'Your score for Physics I is 88%.',
    time: '1h ago',
  },
  {
    title: 'Reminder',
    description: 'Chemistry exam starts in 24 hours.',
    time: '3h ago',
  },
];

export function RightSidebar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const { setOpenModule } = useAccessibilityPanel();
  const { setIsOpen: setChatbotOpen } = useChatbot();
  const { isExamMode } = useExamMode();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isListening, toggleListening, isLoading: isVoiceLoading } = useVoiceControl();

  const handleIconClick = (action: () => void) => {
    if (!isExamMode) {
      action();
    }
  };
  
  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
    router.push('/');
  };

  const userName = user?.displayName || 'Student';
  const userInitial =
    userName
      .split(' ')
      .map((n) => n[0])
      .join('') || 'U';

  return (
    <aside className="fixed right-0 top-0 h-full w-16 bg-card/80 border-l border-border/80 flex flex-col items-center justify-between py-6 z-40">
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
              onClick={() => router.push('/settings/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/settings/accessibility')}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Accessibility</span>
            </DropdownMenuItem>
             <DropdownMenuItem
              onClick={() => router.push('/help')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Guidance</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Middle Section: Utilities & Accessibility */}
      <div className="flex flex-col items-center gap-2">
        <TooltipProvider>
            {/* Core Tools */}
            <div className='flex flex-col items-center gap-2'>
                <DropdownMenu>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                        <div
                            className={cn(
                            'p-3 rounded-full transition-colors relative',
                            !isExamMode && 'cursor-pointer hover:bg-muted'
                            )}
                            onClick={() => handleIconClick(() => {})}
                            aria-disabled={isExamMode}
                        >
                            <Bell
                            className={cn(
                                'h-6 w-6 text-muted-foreground',
                                isExamMode && 'opacity-50 cursor-not-allowed'
                            )}
                            />
                            {!isExamMode && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">
                                {notifications.length}
                            </Badge>
                            )}
                        </div>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Notifications</p>
                    </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent side="left" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.map((n, i) => (
                        <DropdownMenuItem
                        key={i}
                        className="flex flex-col items-start gap-1"
                        >
                        <div className="flex justify-between w-full">
                            <p className="font-semibold">{n.title}</p>
                            <p className="text-xs text-muted-foreground">{n.time}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {n.description}
                        </p>
                        </DropdownMenuItem>
                    ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                    <TooltipTrigger
                    onClick={() => handleIconClick(() => setChatbotOpen(true))}
                    disabled={isExamMode}
                    >
                    <div
                        className={cn(
                        'p-3 rounded-full transition-colors',
                        !isExamMode && 'cursor-pointer hover:bg-muted'
                        )}
                    >
                        <Bot
                        className={cn(
                            'h-6 w-6 text-muted-foreground',
                            isExamMode && 'opacity-50 cursor-not-allowed'
                        )}
                        />
                    </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                    <p>AI Assistant</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            
            <Separator className="my-2 w-10/12" />

            {/* Accessibility Icons */}
            <div className='flex flex-col items-center gap-2'>
                {accessibilityModules.map((module) => {
                    const Icon = module.icon;
                    return (
                    <Tooltip key={module.id}>
                        <TooltipTrigger onClick={() => setOpenModule(module.id)}>
                        <div className="p-3 rounded-full hover:bg-muted transition-colors cursor-pointer">
                            <Icon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                        <p>{module.title} Settings</p>
                        </TooltipContent>
                    </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
      </div>

       {/* Bottom Section: Theme & Voice */}
      <div className="flex flex-col items-center gap-2">
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger onClick={toggleListening} disabled={isVoiceLoading}>
                    <div className={cn(
                        "p-2 rounded-full hover:bg-muted transition-colors cursor-pointer",
                        isListening && "bg-destructive/20"
                    )}>
                        {isVoiceLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isListening ? (
                            <MicOff className="h-5 w-5 text-destructive" />
                        ) : (
                            <Mic className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left"><p>{isListening ? 'Stop Voice Control' : 'Start Voice Control'}</p></TooltipContent>
            </Tooltip>

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
