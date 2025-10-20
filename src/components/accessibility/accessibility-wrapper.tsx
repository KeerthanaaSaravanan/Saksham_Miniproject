
'use client';

import { useAccessibilityPanel } from "./accessibility-panel-provider";
import { cn } from "@/lib/utils";

export function AccessibilityWrapper({ children }: { children: React.ReactNode }) {
    const { userProfile, isLoading } = useAccessibilityPanel();
    const accessibility = userProfile?.accessibility_profile || {};

    const textSizeClass = accessibility.largeText === 'large' ? 'text-lg' : accessibility.largeText === 'xlarge' ? 'text-xl' : '';

    if(isLoading) {
        return <div className="h-screen w-full flex items-center justify-center">Loading accessibility settings...</div>;
    }

    return (
        <div className={cn(
            accessibility.dyslexiaFriendlyFont && "font-dyslexic",
            accessibility.highContrast && "dark",
            textSizeClass
        )}>
            {children}
        </div>
    );
}
