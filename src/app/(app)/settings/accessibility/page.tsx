
'use client';

import { useState, useEffect } from 'react';
import AccessibilityModules from '@/components/AccessibilityModules';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccessibilitySettingsPage() {
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    
    // Mocking user profile and loading state
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching accessibility profile
        setTimeout(() => {
            const mockProfile = {
                textToSpeech: false,
                speechToText: false,
                voiceNavigation: true,
                highContrast: false,
                largeText: 'normal',
                dyslexiaFriendlyFont: true
            };
            setUserProfile(mockProfile);
            setIsLoading(false);
        }, 500);
    }, []);
    
    const handleSettingsUpdate = async (settings: any) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save settings.' });
            return;
        }

        // Mock saving settings
        console.log("Mock saving accessibility settings:", settings);
        setUserProfile(settings); // Optimistically update local state

        toast({ title: 'Settings Saved', description: 'Your accessibility preferences have been updated.' });
    };

    if (isLoading || isUserLoading) {
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
