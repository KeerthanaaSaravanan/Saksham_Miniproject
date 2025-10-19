'use client';

import { useState, useEffect } from 'react';
import AccessibilityModules from '@/components/AccessibilityModules';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccessibilitySettingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        if (user && firestore) {
            const profileRef = doc(firestore, 'users', user.uid, 'accessibility_profile', 'settings');
            getDoc(profileRef).then(docSnap => {
                if (docSnap.exists()) {
                    setUserProfile({ accessibility_profile: docSnap.data() });
                } else {
                    setUserProfile({ accessibility_profile: {} }); // Default empty profile
                }
                setIsLoading(false);
            }).catch(error => {
                const permissionError = new FirestorePermissionError({
                  path: profileRef.path,
                  operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
                setIsLoading(false);
            });
        } else if (!isUserLoading) {
            setIsLoading(false);
        }
    }, [user, firestore, isUserLoading, toast]);
    
    const handleSettingsUpdate = async (settings: any) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save settings.' });
            return;
        }

        const profileRef = doc(firestore, 'users', user.uid, 'accessibility_profile', 'settings');
        
        setDoc(profileRef, settings, { merge: true })
            .then(() => {
                 toast({ title: 'Settings Saved', description: 'Your accessibility preferences have been updated.' });
                 // Update local state to reflect changes
                 setUserProfile({ accessibility_profile: settings });
            })
            .catch((error: any) => {
                const permissionError = new FirestorePermissionError({
                    path: profileRef.path,
                    operation: 'update', // or 'create' if it's the first time
                    requestResourceData: settings,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
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
