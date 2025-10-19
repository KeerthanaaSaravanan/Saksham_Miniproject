import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ChatbotProvider } from '@/components/chatbot/chatbot-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F7F9FC] via-[#E8F4F8] to-[#D6EDF6] dark:from-[#0B1426] dark:via-[#111B2E] dark:to-[#1A2642]">
      <SidebarNav />
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">
        <ChatbotProvider>
            {children}
        </ChatbotProvider>
      </main>
    </div>
  );
}
