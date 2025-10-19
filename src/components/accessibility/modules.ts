
import {
  Eye, Ear, Hand, BookOpen, Brain, Volume2, Mic, Navigation, Headphones, Type, Presentation, Zap, Bot,
  ScanEye, Save, SpellCheck, Focus, Palette, Layout, Clock, Heart, MousePointer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AccessibilityFeature {
    key: string;
    label: string;
    description?: string;
    icon: LucideIcon;
}

export interface AccessibilityModule {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  features: AccessibilityFeature[];
}


export const accessibilityModules: AccessibilityModule[] = [
    {
      id: 'visual',
      title: 'Visual Disability',
      subtitle: 'Blind / Low Vision',
      icon: Eye,
      iconColor: 'text-blue-500',
      features: [
        { key: 'textToSpeech', label: 'Text-to-Speech (TTS)', description: 'Reads questions and options aloud.', icon: Volume2 },
        { key: 'speechToText', label: 'Speech-to-Text (STT)', description: 'Answer questions by speaking.', icon: Mic },
        { key: 'voiceNavigation', label: 'Audio Navigation', description: 'Navigate the exam with voice commands.', icon: Navigation },
        { key: 'highContrast', label: 'High Contrast Mode', description: 'Increases text and background contrast.', icon: Palette },
        { key: 'largeText', label: 'Large Text Mode', description: 'Makes all text on the screen bigger.', icon: Type },
      ]
    },
    {
      id: 'hearing',
      title: 'Hearing Disability',
      subtitle: 'Deaf / Hard of Hearing',
      icon: Ear,
      iconColor: 'text-purple-500',
      features: [
        { key: 'realTimeCaptions', label: 'Real-time Captions', description: 'Provides captions for any audio content.', icon: Type },
        { key: 'signLanguageAvatar', label: 'AI Sign Language Avatar', description: 'Shows an avatar interpreting questions.', icon: Presentation },
        { key: 'visualAlerts', label: 'Visual Pop-up Alerts', description: 'Replaces sound alerts with on-screen pop-ups.', icon: Zap },
        { key: 'chatbotHelp', label: 'Text-based Chatbot Help', description: 'Get help via text instead of voice.', icon: Bot }
      ]
    },
    {
      id: 'motor',
      title: 'Motor Disability',
      subtitle: 'Limited Hand Movement',
      icon: Hand,
      iconColor: 'text-orange-500',
      features: [
        { key: 'voiceCommandNavigation', label: 'Voice Command Navigation', description: 'Control the entire exam with your voice.', icon: Mic },
        { key: 'eyeTracking', label: 'Eye-tracking Control (Coming Soon)', description: 'Use your eyes to select answers.', icon: ScanEye },
        { key: 'gestureRecognition', label: 'AI Gesture Recognition (Coming Soon)', description: 'Use head or hand gestures.', icon: Hand },
        { key: 'autoSave', label: 'Auto-save Answers', description: 'Automatically saves your progress.', icon: Save },
        { key: 'predictiveText', label: 'Predictive Typing', description: 'Speeds up written answers.', icon: Type },
      ]
    },
    {
      id: 'sld',
      title: 'Learning Disability',
      subtitle: 'Dyslexia, Dysgraphia, etc.',
      icon: BookOpen,
      iconColor: 'text-green-500',
      features: [
        { key: 'aiTextSimplifier', label: 'AI Text Simplifier', description: 'Rephrases complex questions simply.', icon: Brain },
        { key: 'dyslexiaFriendlyFont', label: 'Dyslexia-friendly Fonts', description: 'Switch to easier-to-read fonts.', icon: Type },
        { key: 'wordHighlighting', label: 'Word Highlighting', description: 'Focus on one word at a time.', icon: Focus },
        { key: 'aiSpellCheck', label: 'AI Spell-check', description: 'Advanced spelling corrections.', icon: SpellCheck },
        { key: 'readAloud', label: 'Read-aloud Support', description: 'Have any text read to you.', icon: Volume2 }
      ]
    },
    {
      id: 'cognitive',
      title: 'Cognitive Disability',
      subtitle: 'Autism, ADHD, etc.',
      icon: Brain,
      iconColor: 'text-sky-500',
      features: [
        { key: 'focusMode', label: 'Focus Mode (Calm Visuals)', description: 'Removes all non-essential UI.', icon: Palette },
        { key: 'guidedNavigation', label: 'Step-by-step Guidance', description: 'Breaks the exam into single questions.', icon: MousePointer },
        { key: 'timeReminders', label: 'Gentle Time Reminders', description: 'Non-intrusive time notifications.', icon: Clock },
        { key: 'emotionAwareAgent', label: 'Emotion-aware AI Agent (Coming Soon)', description: 'Offers encouragement if frustrated.', icon: Heart },
        { key: 'simplifiedLayout', label: 'Simplified Layout', description: 'A cleaner interface with larger icons.', icon: Layout },
      ]
    }
];
