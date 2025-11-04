
'use client';

import { useState, useEffect } from 'react';
import AccessibilityModules from '@/components/AccessibilityModules';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccessibilitySettingsPage() {
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            // Simulate loading from localStorage or a non-DB source
            try {
                const savedSettings = localStorage.getItem(`accessibility_settings_${user.uid}`);
                if (savedSettings) {
                    setUserProfile({ accessibility_profile: JSON.parse(savedSettings) });
                } else {
                    setUserProfile({ accessibility_profile: {} }); // Default empty profile
                }
            } catch (e) {
                 setUserProfile({ accessibility_profile: {} });
            } finally {
                setIsLoading(false);
            }
        } else if (!isUserLoading) {
            setIsLoading(false);
        }
    }, [user, isUserLoading]);
    
    const handleSettingsUpdate = async (settings: any) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save settings.' });
            return;
        }

        try {
            localStorage.setItem(`accessibility_settings_${user.uid}`, JSON.stringify(settings));
            toast({ title: 'Settings Saved (Locally)', description: 'Your accessibility preferences have been updated.' });
            // Update local state to reflect changes
            setUserProfile({ accessibility_profile: settings });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings locally.' });
        }
    };

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
            <AccessibilityModules 
                userProfile={userProfile}
                onSettingsUpdate={handleSettingsUpdate}
            />
        </div>
    );
}

    