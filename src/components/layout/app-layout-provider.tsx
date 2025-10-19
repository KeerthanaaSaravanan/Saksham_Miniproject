
'use client';

import { ChatbotProvider } from '@/components/chatbot/chatbot-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { AccessibilityPanelProvider } from '../accessibility/accessibility-panel-provider';

export default function AppLayoutProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AccessibilityPanelProvider>
                <ChatbotProvider>
                    {children}
                </ChatbotProvider>
            </AccessibilityPanelProvider>
        </ThemeProvider>
    );
}
