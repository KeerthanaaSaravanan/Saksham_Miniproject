'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAccessibilityPanel } from '../accessibility/accessibility-panel-provider';
import { accessibilityModules } from '../accessibility/modules';

export function RightSidebar() {
  const { setOpenModule } = useAccessibilityPanel();
  
  return (
    <aside className="fixed right-0 top-0 h-full w-20 bg-card/80 border-l border-border/80 flex flex-col items-center justify-center py-6 z-40">
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
