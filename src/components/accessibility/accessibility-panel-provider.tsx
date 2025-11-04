
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
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
  const [userProfile, setUserProfile] = useState<{ accessibility_profile: AccessibilitySettings } | null>({ accessibility_profile: { largeText: 'normal' } });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

   const loadSettings = useCallback(() => {
    if (user) {
        setIsLoading(true);
        try {
            const savedSettings = localStorage.getItem(`accessibility_settings_${user.uid}`);
            if (savedSettings) {
                setUserProfile({ accessibility_profile: JSON.parse(savedSettings) });
            } else {
                setUserProfile({ accessibility_profile: { largeText: 'normal' } });
            }
        } catch (e) {
            setUserProfile({ accessibility_profile: { largeText: 'normal' } });
        } finally {
            setIsLoading(false);
        }
    } else {
        // Not logged in, use default
        setUserProfile({ accessibility_profile: { largeText: 'normal' } });
        setIsLoading(false);
    }
   }, [user]);

   useEffect(() => {
    loadSettings();
    // Add a custom event listener to reload settings when they are updated elsewhere
    window.addEventListener('accessibilitySettingsChanged', loadSettings);
    return () => {
      window.removeEventListener('accessibilitySettingsChanged', loadSettings);
    };
  }, [loadSettings]);

  const handleSettingsUpdate = async (settings: any) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save settings.' });
        return;
    }

    try {
        localStorage.setItem(`accessibility_settings_${user.uid}`, JSON.stringify(settings));
        toast({ title: 'Settings Saved (Locally)', description: 'Your accessibility preferences have been updated.' });
        setUserProfile({ accessibility_profile: settings });
        // Dispatch an event to notify other components of the change
        window.dispatchEvent(new Event('accessibilitySettingsChanged'));
    } catch (e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings locally.' });
    }
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

    