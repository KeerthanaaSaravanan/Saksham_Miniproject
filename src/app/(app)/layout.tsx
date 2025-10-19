import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ChatbotProvider } from '@/components/chatbot/chatbot-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <SidebarNav />
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">
        <ChatbotProvider>
            {children}
        </ChatbotProvider>
      </main>
    </div>
  );
}
