'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Eye,
  Ear,
  Hand,
  BookOpen,
  Brain,
} from 'lucide-react';
import { useAccessibilityPanel } from '../accessibility/accessibility-panel-provider';
import { accessibilityModules } from '../accessibility/modules';
import { useExamMode } from '@/hooks/use-exam-mode';
import { cn } from '@/lib/utils';

export function RightSidebar() {
  const { setOpenModule } = useAccessibilityPanel();
  const { isExamMode } = useExamMode();

  if (isExamMode) {
    return null;
  }

  return (
    <aside className={cn("fixed right-0 top-0 h-full w-20 bg-card/80 border-l border-border/80 flex flex-col items-center justify-center py-6 z-40 transition-opacity duration-300", isExamMode ? "opacity-0 pointer-events-none" : "opacity-100")}>
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
    </aside>
  );
}
