
'use client';

import { useAccessibilityPanel } from "./accessibility-panel-provider";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export function AccessibilityWrapper({ children }: { children: React.ReactNode }) {
    const { userProfile, isLoading } = useAccessibilityPanel();
    const accessibility = userProfile?.accessibility_profile || {};

    const textSizeClass = accessibility.largeText === 'large' ? 'text-lg' : accessibility.largeText === 'xlarge' ? 'text-xl' : '';

    if(isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="w-full max-w-md space-y-4">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-10 w-1/2 mx-auto" />
                </div>
            </div>
        );
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
