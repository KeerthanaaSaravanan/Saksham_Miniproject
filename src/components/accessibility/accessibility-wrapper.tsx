'use client';

import { useAccessibilityPanel } from "./accessibility-panel-provider";
import { cn } from "@/lib/utils";

export function AccessibilityWrapper({ children }: { children: React.ReactNode }) {
    const { userProfile } = useAccessibilityPanel();
    const accessibility = userProfile?.accessibility_profile || {};

    return (
        <div className={cn(
            accessibility.dyslexiaFriendlyFont && "font-dyslexic",
            accessibility.highContrast && "dark",
            accessibility.largeText && "text-lg"
        )}>
            {children}
        </div>
    );
}
