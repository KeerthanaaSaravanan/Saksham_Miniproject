
import {
  Eye, Ear, Hand, BookOpen, Brain, Volume2, Mic, Navigation, Type, Presentation, Zap, Bot,
  ScanEye, Save, SpellCheck, Focus, Palette, Layout, Clock, Heart, MousePointer, CaseUpper, PenTool
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type FeatureType = 'boolean' | 'radio';

export interface AccessibilityFeature {
    key: string;
    label: string;
    description?: string;
    icon: LucideIcon;
    type: FeatureType;
    defaultValue: string | boolean;
    options?: { value: string; label: string }[];
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
        { key: 'textToSpeech', label: 'Text-to-Speech (TTS)', description: 'Reads questions and options aloud.', icon: Volume2, type: 'boolean', defaultValue: false },
        { key: 'speechToText', label: 'Speech-to-Text (STT)', description: 'Answer questions by speaking.', icon: Mic, type: 'boolean', defaultValue: false },
        { key: 'voiceNavigation', label: 'Audio Navigation', description: 'Navigate the exam with voice commands.', icon: Navigation, type: 'boolean', defaultValue: false },
        { key: 'highContrast', label: 'High Contrast Mode', description: 'Increases text and background contrast.', icon: Palette, type: 'boolean', defaultValue: false },
        { key: 'largeText', label: 'Text Size', description: 'Makes all text on the screen bigger.', icon: CaseUpper, type: 'radio', defaultValue: 'normal', options: [{value: 'normal', label: 'Normal'}, {value: 'large', label: 'Large'}, {value: 'xlarge', label: 'Extra Large'}] },
      ]
    },
    {
      id: 'hearing',
      title: 'Hearing Disability',
      subtitle: 'Deaf / Hard of Hearing',
      icon: Ear,
      iconColor: 'text-purple-500',
      features: [
        { key: 'realTimeCaptions', label: 'Real-time Captions (Coming Soon)', description: 'Provides captions for any audio content.', icon: Type, type: 'boolean', defaultValue: false },
        { key: 'signLanguageAvatar', label: 'AI Sign Language Avatar (Coming Soon)', description: 'Shows an avatar interpreting questions.', icon: Presentation, type: 'boolean', defaultValue: false },
        { key: 'visualAlerts', label: 'Visual Pop-up Alerts', description: 'Replaces sound alerts with on-screen pop-ups.', icon: Zap, type: 'boolean', defaultValue: false },
        { key: 'chatbotHelp', label: 'Text-based Chatbot Help', description: 'Get help via text instead of voice.', icon: Bot, type: 'boolean', defaultValue: false }
      ]
    },
    {
      id: 'motor',
      title: 'Motor Disability',
      subtitle: 'Limited Hand Movement',
      icon: Hand,
      iconColor: 'text-orange-500',
      features: [
        { key: 'voiceCommandNavigation', label: 'Voice Command Navigation', description: 'Control the entire exam with your voice.', icon: Mic, type: 'boolean', defaultValue: false },
        { key: 'eyeTracking', label: 'Eye-tracking Control (Coming Soon)', description: 'Use your eyes to select answers.', icon: ScanEye, type: 'boolean', defaultValue: false },
        { key: 'gestureRecognition', label: 'AI Gesture Recognition (Coming Soon)', description: 'Use head or hand gestures.', icon: Hand, type: 'boolean', defaultValue: false },
        { key: 'autoSave', label: 'Auto-save Answers', description: 'Automatically saves your progress.', icon: Save, type: 'boolean', defaultValue: true },
        { key: 'predictiveText', label: 'Predictive Typing (Coming Soon)', description: 'Speeds up written answers.', icon: Type, type: 'boolean', defaultValue: false },
      ]
    },
    {
      id: 'sld',
      title: 'Specific Learning Disability',
      subtitle: 'Dyslexia, Dysgraphia, etc.',
      icon: BookOpen,
      iconColor: 'text-green-500',
      features: [
        { key: 'aiTextSimplifier', label: 'AI Text Simplifier (Coming Soon)', description: 'Rephrases complex questions simply.', icon: Brain, type: 'boolean', defaultValue: false },
        { key: 'dyslexiaFriendlyFont', label: 'Dyslexia-friendly Fonts', description: 'Switch to easier-to-read fonts.', icon: Type, type: 'boolean', defaultValue: false },
        { key: 'handwritingMode', label: 'Handwriting Mode (Coming Soon)', description: 'Use a digital pen for written answers.', icon: PenTool, type: 'boolean', defaultValue: false },
        { key: 'wordHighlighting', label: 'Word Highlighting (Coming Soon)', description: 'Focus on one word at a time.', icon: Focus, type: 'boolean', defaultValue: false },
        { key: 'aiSpellCheck', label: 'AI Spell-check (Coming Soon)', description: 'Advanced spelling corrections.', icon: SpellCheck, type: 'boolean', defaultValue: true },
        { key: 'readAloud', label: 'Read-aloud Support', description: 'Have any text read to you.', icon: Volume2, type: 'boolean', defaultValue: false }
      ]
    },
    {
      id: 'cognitive',
      title: 'Cognitive Disability',
      subtitle: 'Autism, ADHD, etc.',
      icon: Brain,
      iconColor: 'text-sky-500',
      features: [
        { key: 'focusMode', label: 'Focus Mode (Calm Visuals)', description: 'Removes all non-essential UI.', icon: Palette, type: 'boolean', defaultValue: false },
        { key: 'guidedNavigation', label: 'Step-by-step Guidance', description: 'Breaks the exam into single questions.', icon: MousePointer, type: 'boolean', defaultValue: false },
        { key: 'timeReminders', label: 'Gentle Time Reminders', description: 'Non-intrusive time notifications.', icon: Clock, type: 'boolean', defaultValue: true },
        { key: 'emotionAwareAgent', label: 'Emotion-aware AI Agent (Coming Soon)', description: 'Offers encouragement if frustrated.', icon: Heart, type: 'boolean', defaultValue: false },
        { key: 'simplifiedLayout', label: 'Simplified Layout', description: 'A cleaner interface with larger icons.', icon: Layout, type: 'boolean', defaultValue: false },
      ]
    }
];
