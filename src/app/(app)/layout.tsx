import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ChatbotProvider } from '@/components/chatbot/chatbot-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <ChatbotProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
          </div>
        </ChatbotProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
