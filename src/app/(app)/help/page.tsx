import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Eye, Ear, Hand, BookOpen, Brain } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Help & Guidance</h1>
        <p className="text-muted-foreground">
          Everything you need to know about using the Saksham platform.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-lg">Visual Disability (Blind / Low Vision)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pl-8">
            <p>Features designed for users who cannot see text, images, or UI components clearly.</p>
            <ul>
              <li><strong>Text-to-Speech (TTS):</strong> Reads every question, option, and instruction aloud.</li>
              <li><strong>Speech-to-Text (STT):</strong> Allows you to answer questions by speaking. Your spoken answers are automatically converted to text.</li>
              <li><strong>Voice Navigation:</strong> Use voice commands like "Next question", "Previous", or "Submit" to navigate the exam.</li>
              <li><strong>Audio Feedback on Actions:</strong> Hear confirmation sounds when you select an answer or move to a new section.</li>
              <li><strong>Accessible Diagrams / Alt Text:</strong> All images and graphs have descriptive audio alternatives.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <Ear className="h-5 w-5 text-purple-500" />
              <span className="font-semibold text-lg">Hearing Disability (Deaf / Hard of Hearing)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pl-8">
            <p>Features for users who require textual and visual cues instead of sound.</p>
            <ul>
              <li><strong>Real-time Captions:</strong> For any audio or video content, synchronized captions are displayed.</li>
              <li><strong>Visual Alerts:</strong> Replaces sound notifications with on-screen color flashes, icons, or pop-ups.</li>
              <li><strong>AI Sign Language Avatar:</strong> An optional video window where questions are interpreted in Indian Sign Language (ISL).</li>
              <li><strong>Text-based Chatbot Help:</strong> Access help through a real-time text chat instead of audio calls.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <Hand className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-lg">Motor Disability</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pl-8">
            <p>Hands-free interaction tools for users who cannot use a mouse or keyboard effectively.</p>
            <ul>
              <li><strong>Voice Command Navigation:</strong> Use your voice to control all aspects of the exam interface.</li>
              <li><strong>Eye-tracking Control:</strong> (Coming Soon) Use your gaze to select options and navigate.</li>
              <li><strong>AI Gesture Recognition:</strong> (Coming Soon) Use simple head or hand gestures to control the interface.</li>
              <li><strong>Auto-save Answers:</strong> Your progress is automatically saved as you go.</li>
              <li><strong>Predictive Typing:</strong> Get suggestions as you type to speed up written answers.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-lg">Specific Learning Disability (SLD)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pl-8">
            <p>Tools for users who struggle with reading, writing, or number comprehension.</p>
            <ul>
              <li><strong>AI Text Simplifier:</strong> Rephrases complex questions into simpler language.</li>
              <li><strong>Dyslexia-friendly Fonts:</strong> Option to switch to fonts designed for easier reading, like OpenDyslexic.</li>
              <li><strong>Word Highlighting:</strong> Focus on one word or line at a time as it's read aloud.</li>
              <li><strong>AI Spell-check:</strong> Advanced spell-checker that understands phonetic and dyslexic spelling patterns.</li>
              <li><strong>Read-aloud Support:</strong> Have any text on the screen read to you on demand.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-sky-500" />
              <span className="font-semibold text-lg">Cognitive Disability</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pl-8">
            <p>Features designed to create a simple, predictable, and distraction-free experience.</p>
            <ul>
              <li><strong>Focus Mode (Calm Visuals):</strong> Removes all non-essential UI elements to help you focus on the current question.</li>
              <li><strong>Step-by-step Guidance:</strong> Breaks the exam into a one-question-at-a-time flow.</li>
              <li><strong>Gentle Time Reminders:</strong> Provides soft, non-intrusive reminders about the remaining time.</li>
              <li><strong>Emotion-aware AI Agent:</strong> (Coming Soon) The AI assistant can offer encouragement if it detects signs of frustration.</li>
              <li><strong>Simplified Layout:</strong> A cleaner interface with larger icons and shorter instructions.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
