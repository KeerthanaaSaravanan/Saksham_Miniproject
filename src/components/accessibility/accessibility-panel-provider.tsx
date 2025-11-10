
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { AccessibilityFlyout } from './accessibility-flyout';
import { accessibilityModules } from './modules';
import { useUser } from '@/firebase';
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
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [accessibilityProfile, setAccessibilityProfile] = useState<AccessibilitySettings>({ largeText: 'normal' });
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    setIsProfileLoading(true);
    // Simulate loading profile
    setTimeout(() => {
      setAccessibilityProfile({
        largeText: 'normal',
        textToSpeech: false,
        highContrast: false,
        dyslexiaFriendlyFont: true
      });
      setIsProfileLoading(false);
    }, 500);
  }, []);

  const userProfile = useMemo(() => ({
    accessibility_profile: accessibilityProfile
  }), [accessibilityProfile]);
  
  const isLoading = isUserLoading || isProfileLoading;

  const handleSettingsUpdate = async (settings: any) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save settings.' });
        return;
    }
    
    // Mock saving the settings
    console.log("Mock saving accessibility settings:", settings);
    setAccessibilityProfile(settings); // Optimistically update state

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
