
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import { AccessibilityWrapper } from '@/components/accessibility/accessibility-wrapper';
import { AccessibilityPanelProvider } from '@/components/accessibility/accessibility-panel-provider';
import { VoiceControlProvider } from '@/components/voice-control-provider';
import { ExamModeProvider } from '@/hooks/use-exam-mode';

export const metadata: Metadata = {
  title: 'Saksham - Accessible Learning Platform',
  description: 'An AI-powered platform providing an inclusive and personalized educational experience for students with disabilities.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
         <link href="https://fonts.googleapis.com/css2?family=Open+Dyslexic:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseClientProvider>
            <ExamModeProvider>
              <AccessibilityPanelProvider>
                <VoiceControlProvider>
                  <AccessibilityWrapper>
                    {children}
                  </AccessibilityWrapper>
                </VoiceControlProvider>
              </AccessibilityPanelProvider>
            </ExamModeProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
