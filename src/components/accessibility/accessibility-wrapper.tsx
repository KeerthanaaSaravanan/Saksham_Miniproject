

'use client';

import { useAccessibilityPanel } from "./accessibility-panel-provider";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export function AccessibilityWrapper({ children }: { children: React.ReactNode }) {
    const { userProfile, isLoading } = useAccessibilityPanel();
    const accessibility = userProfile?.accessibility_profile || {};

    const highContrastClass =
        accessibility.highContrast === 'white-on-black' ? 'hc-white-on-black'
      : accessibility.highContrast === 'black-on-white' ? 'hc-black-on-white'
      : accessibility.highContrast === 'yellow-on-black' ? 'hc-yellow-on-black'
      : '';
      
    const fontSizeStyle = accessibility.textSize ? { fontSize: `${accessibility.textSize}px` } : {};

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
            highContrastClass
        )}
        style={fontSizeStyle}>
            {children}
        </div>
    );
}
