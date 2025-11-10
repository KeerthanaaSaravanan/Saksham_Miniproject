
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { AccessibilityFlyout } from './accessibility-flyout';
import { accessibilityModules } from './modules';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const profileRef = useMemoFirebase(() => user && firestore && doc(firestore, `users/${user.uid}/accessibility_profile`, 'settings'), [user, firestore]);
  const { data: accessibilityProfile, isLoading: isProfileLoading } = useDoc<AccessibilitySettings>(profileRef);

  const userProfile = useMemo(() => ({
    accessibility_profile: accessibilityProfile || { largeText: 'normal' }
  }), [accessibilityProfile]);
  
  const isLoading = isUserLoading || isProfileLoading;

  const handleSettingsUpdate = async (settings: any) => {
    if (!profileRef) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save settings.' });
        return;
    }
    updateDocumentNonBlocking(profileRef, settings);
    toast({ title: 'Settings Saved', description: 'Your accessibility preferences have been updated.' });
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
