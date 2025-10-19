'use client';

import { ChatbotProvider } from '@/components/chatbot/chatbot-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { AccessibilityPanelProvider } from '../accessibility/accessibility-panel-provider';
import { VoiceControlProvider } from '../voice-control-provider';

export default function AppLayoutProvider({ children }: { children: React.ReactNode }) {
    return (
        <AccessibilityPanelProvider>
            <VoiceControlProvider>
                <ChatbotProvider>
                    {children}
                </ChatbotProvider>
            </VoiceControlProvider>
        </AccessibilityPanelProvider>
    );
}
