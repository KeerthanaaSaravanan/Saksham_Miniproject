

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Eye,
  Ear,
  Hand,
  BookOpen,
  Brain,
  Route,
  Settings,
  Bot,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const faqItems = [
  {
    id: 'visual',
    icon: Eye,
    iconColor: 'text-blue-500',
    title: 'Visual Disability (Blind / Low Vision)',
    content: `
        <p>Features designed for users who cannot see text, images, or UI components clearly.</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
          <li><strong>Text-to-Speech (TTS):</strong> Reads every question, option, and instruction aloud.</li>
          <li><strong>Speech-to-Text (STT):</strong> Allows you to answer questions by speaking. Your spoken answers are automatically converted to text.</li>
          <li><strong>Voice Navigation:</strong> Use voice commands like "Next question", "Previous", or "Submit" to navigate the exam.</li>
          <li><strong>High Contrast Mode:</strong> Dramatically increases the color contrast between text and backgrounds to make content more readable.</li>
        </ul>
      `,
  },
  {
    id: 'hearing',
    icon: Ear,
    iconColor: 'text-purple-500',
    title: 'Hearing Disability (Deaf / Hard of Hearing)',
    content: `
        <p>Features for users who require textual and visual cues instead of sound.</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
          <li><strong>Real-time Captions (Coming Soon):</strong> For any audio or video content, synchronized captions are displayed.</li>
          <li><strong>Visual Alerts (Coming Soon):</strong> Replaces sound notifications with on-screen color flashes, icons, or pop-ups.</li>
          <li><strong>AI Sign Language Avatar (Coming Soon):</strong> An optional video window where questions are interpreted in Indian Sign Language (ISL).</li>
          <li><strong>Text-based Chatbot Help (Coming Soon):</strong> Access help through a real-time text chat instead of audio calls.</li>
        </ul>
      `,
  },
  {
    id: 'motor',
    icon: Hand,
    iconColor: 'text-orange-500',
    title: 'Motor Disability',
    content: `
        <p>Hands-free interaction tools for users who cannot use a mouse or keyboard effectively.</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
          <li><strong>Voice Command Navigation (Coming Soon):</strong> Use your voice to control all aspects of the exam interface.</li>
          <li><strong>Eye-tracking Control (Coming Soon):</strong> Use your gaze to select options and navigate.</li>
          <li><strong>AI Gesture Recognition (Coming Soon):</strong> Use simple head or hand gestures to control the interface.</li>
          <li><strong>Auto-save Answers (Coming Soon):</strong> Your progress is automatically saved as you go.</li>
        </ul>
      `,
  },
  {
    id: 'sld',
    icon: BookOpen,
    iconColor: 'text-green-500',
    title: 'Specific Learning Disability (SLD)',
    content: `
        <p>Tools for users who struggle with reading, writing, or number comprehension.</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
          <li><strong>AI Text Simplifier (Coming Soon):</strong> Rephrases complex questions into simpler language.</li>
          <li><strong>Dyslexia-friendly Fonts:</strong> Option to switch to fonts designed for easier reading, like OpenDyslexic.</li>
          <li><strong>Handwriting Mode (Coming Soon):</strong> Allows you to use a digital pen or stylus to write answers, which are then converted to text.</li>
          <li><strong>Word Highlighting (Coming Soon):</strong> Focus on one word or line at a time as it's read aloud.</li>
          <li><strong>AI Spell-check (Coming Soon):</strong> Advanced spell-checker that understands phonetic and dyslexic spelling patterns.</li>
        </ul>
      `,
  },
  {
    id: 'cognitive',
    icon: Brain,
    iconColor: 'text-sky-500',
    title: 'Cognitive Disability',
    content: `
        <p>Features designed to create a simple, predictable, and distraction-free experience.</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
          <li><strong>Focus Mode (Calm Visuals) (Coming Soon):</strong> Removes all non-essential UI elements to help you focus on the current question.</li>
          <li><strong>Step-by-step Guidance (Coming Soon):</strong> Breaks the exam into a one-question-at-a-time flow.</li>
          <li><strong>Gentle Time Reminders (Coming Soon):</strong> Provides soft, non-intrusive reminders about the remaining time.</li>
          <li><strong>Simplified Layout (Coming Soon):</strong> A cleaner interface with larger icons and shorter instructions.</li>
        </ul>
      `,
  },
];

const QuickLink = ({ icon: Icon, title, description, href }: { icon: any, title: string, description: string, href: string }) => (
    <Link href={href} className="block hover:bg-muted/50 p-4 rounded-lg transition-colors border">
        <div className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-full">
                <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
    </Link>
);


export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Help & Guidance</h1>
        <p className="text-muted-foreground">
          Everything you need to know about using the Saksham platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Accessibility Features FAQ</CardTitle>
                    <CardDescription>
                        Find detailed explanations for all the accessibility tools available on the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                 <AccordionItem key={item.id} value={item.id}>
                                  <AccordionTrigger className="text-base">
                                    <div className="flex items-center gap-3">
                                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                                      <span className="font-semibold">
                                        {item.title}
                                      </span>
                                    </div>
                                  </AccordionTrigger>
                                   <AccordionContent>
                                    <div
                                      className="prose prose-sm dark:prose-invert max-w-none pl-8"
                                      dangerouslySetInnerHTML={{ __html: item.content }}
                                    />
                                  </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                     </Accordion>
                </CardContent>
            </Card>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>Jump to key sections of the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <QuickLink icon={Route} title="Application Flow" description="See how Saksham works." href="/flow" />
                    <QuickLink icon={Settings} title="Accessibility Settings" description="Customize your tools." href="/settings/accessibility" />
                    <QuickLink icon={Bot} title="AI Assistant" description="Get instant help from our bot." href="#" />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
