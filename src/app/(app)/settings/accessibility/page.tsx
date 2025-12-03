
'use client';

import AccessibilityModules from '@/components/AccessibilityModules';
import { useAccessibilityPanel } from '@/components/accessibility/accessibility-panel-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccessibilitySettingsPage() {
    const { isLoading } = useAccessibilityPanel();

    if (isLoading) {
        return (
             <div className="container mx-auto py-6">
                <div className="space-y-4 text-center">
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                </div>
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6">
            <AccessibilityModules />
        </div>
    );
}
