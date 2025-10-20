
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AccessibilityFlyout } from './accessibility-flyout';
import { accessibilityModules } from './modules';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export interface AccessibilitySettings {
  textToSpeech?: boolean;
  speechToText?: boolean;
  voiceNavigation?: boolean;
  highContrast?: boolean;
  largeText?: 'normal' | 'large' | 'xlarge';
  dyslexiaFriendlyFont?: boolean;
  [key: string]: any;
}

interface AccessibilityPanelContextType {
  openModule: string | null;
  setOpenModule: (module: string | null) => void;
  userProfile: { accessibility_profile: AccessibilitySettings } | null;
  handleSettingsUpdate: (settings: any) => Promise<void>;
  isLoading: boolean;
}

const AccessibilityPanelContext = createContext<AccessibilityPanelContextType | undefined>(undefined);

export function useAccessibilityPanel() {
  const context = useContext(AccessibilityPanelContext);
  if (context === undefined) {
    throw new Error('useAccessibilityPanel must be used within an AccessibilityPanelProvider');
  }
  return context;
}

export function AccessibilityPanelProvider({ children }: { children: ReactNode }) {
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ accessibility_profile: AccessibilitySettings } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

   React.useEffect(() => {
    if (user && firestore) {
      setIsLoading(true);
      const profileRef = doc(firestore, 'users', user.uid, 'accessibility_profile', 'settings');
      const unsubscribe = onSnapshot(profileRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile({ accessibility_profile: docSnap.data() as AccessibilitySettings });
        } else {
          setUserProfile({ accessibility_profile: { largeText: 'normal' } }); // Default empty profile
        }
        setIsLoading(false);
      }, (error) => {
        const permissionError = new FirestorePermissionError({
            path: profileRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else if (!user) {
        setIsLoading(false);
        setUserProfile({ accessibility_profile: { largeText: 'normal' } });
    }
  }, [user, firestore]);

  const handleSettingsUpdate = async (settings: any) => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save settings.' });
        return;
    }

    const profileRef = doc(firestore, 'users', user.uid, 'accessibility_profile', 'settings');
    
    setDoc(profileRef, settings, { merge: true })
        .then(() => {
             toast({ title: 'Settings Saved', description: 'Your accessibility preferences have been updated.' });
             setUserProfile({ accessibility_profile: settings });
        })
        .catch((error: any) => {
            const permissionError = new FirestorePermissionError({
                path: profileRef.path,
                operation: 'update',
                requestResourceData: settings,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const moduleData = openModule ? accessibilityModules.find(m => m.id === openModule) : null;

  return (
    <AccessibilityPanelContext.Provider value={{ openModule, setOpenModule, userProfile, handleSettingsUpdate, isLoading }}>
      {children}
      {moduleData && (
        <AccessibilityFlyout 
            module={moduleData} 
            isOpen={!!openModule} 
            onClose={() => setOpenModule(null)}
            userProfile={userProfile}
            onSettingsUpdate={handleSettingsUpdate}
        />
      )}
    </AccessibilityPanelContext.Provider>
  );
}
