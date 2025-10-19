'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAccessibilityPanel } from '../accessibility/accessibility-panel-provider';
import { accessibilityModules } from '../accessibility/modules';
import { Bot, Bell } from 'lucide-react';
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

const notifications = [
    { title: "New Exam Posted", description: "Algebra II Mid-Term is now available.", time: "5m ago" },
    { title: "Results Released", description: "Your score for Physics I is 88%.", time: "1h ago" },
    { title: "Reminder", description: "Chemistry exam starts in 24 hours.", time: "3h ago" },
];


export function RightSidebar() {
  const { setOpenModule } = useAccessibilityPanel();
  const { setIsOpen: setChatbotOpen } = useChatbot();
  const { isExamMode } = useExamMode();
  
  const handleIconClick = (action: () => void) => {
    if (!isExamMode) {
      action();
    }
  }

  return (
    <aside className="fixed right-0 top-0 h-full w-20 bg-card/80 border-l border-border/80 flex flex-col items-center justify-between py-6 z-40">
      <div />
      <div className="flex flex-col items-center gap-4">
        <TooltipProvider>
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
        </TooltipProvider>
      </div>
       <div className="flex flex-col items-center gap-4">
         <TooltipProvider>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                   <DropdownMenuTrigger asChild>
                     <div 
                        className={cn("p-3 rounded-full transition-colors relative", !isExamMode && "cursor-pointer hover:bg-muted")}
                        onClick={() => handleIconClick(() => {})}
                        aria-disabled={isExamMode}
                      >
                        <Bell className={cn("h-6 w-6 text-muted-foreground", isExamMode && "opacity-50 cursor-not-allowed")} />
                        {!isExamMode && <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{notifications.length}</Badge>}
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
                    <DropdownMenuItem key={i} className="flex flex-col items-start gap-1">
                      <div className="flex justify-between w-full">
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.time}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{n.description}</p>
                    </DropdownMenuItem>
                  ))}
               </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger 
                onClick={() => handleIconClick(() => setChatbotOpen(true))}
                disabled={isExamMode}
              >
                  <div className={cn("p-3 rounded-full transition-colors", !isExamMode && "cursor-pointer hover:bg-muted")}>
                    <Bot className={cn("h-6 w-6 text-muted-foreground", isExamMode && "opacity-50 cursor-not-allowed")} />
                  </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>AI Assistant</p>
              </TooltipContent>
            </Tooltip>
         </TooltipProvider>
       </div>
    </aside>
  );
}
