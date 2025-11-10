
'use client';

import { useState, useEffect } from 'react';
import AccessibilityModules from '@/components/AccessibilityModules';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';

export default function AccessibilitySettingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const profileRef = useMemoFirebase(() => user && firestore && doc(firestore, `users/${user.uid}/accessibility_profile`, 'settings'), [user, firestore]);
    const { data: userProfile, isLoading } = useDoc<any>(profileRef);

    
    const handleSettingsUpdate = async (settings: any) => {
        if (!profileRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save settings.' });
            return;
        }

        updateDocumentNonBlocking(profileRef, settings);
        toast({ title: 'Settings Saved', description: 'Your accessibility preferences have been updated.' });
        // The useDoc hook will handle state updates automatically
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
