'use client';

import { ChatbotProvider } from '@/components/chatbot/chatbot-provider';
import { AccessibilityPanelProvider } from '../accessibility/accessibility-panel-provider';
import { usePathname } from 'next/navigation';

export default function AppLayoutProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith('/admin');

    if (isAdminRoute) {
        return <>{children}</>;
    }

    return (
        <AccessibilityPanelProvider>
            <ChatbotProvider>
                {children}
            </ChatbotProvider>
        </AccessibilityPanelProvider>
    );
}
