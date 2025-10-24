
import {
  Eye, Ear, Hand, BookOpen, Brain, Volume2, Mic, Navigation, Type, Presentation, Zap, Bot,
  ScanEye, Save, SpellCheck, Focus, Palette, Layout, Clock, Heart, MousePointer, CaseUpper, PenTool, TextSelect, MessageSquare, Video
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
          { key: 'realtimeCaptions', label: 'Real-time Captions (Coming Soon)', description: 'Displays synchronized captions for any audio or video content.', icon: MessageSquare, type: 'boolean', defaultValue: false },
          { key: 'visualAlerts', label: 'Visual Alerts (Coming Soon)', description: 'Replaces sound notifications with on-screen visual cues.', icon: Presentation, type: 'boolean', defaultValue: false },
          { key: 'islAvatar', label: 'AI Sign Language Avatar (Coming Soon)', description: 'Interprets questions in Indian Sign Language (ISL).', icon: Video, type: 'boolean', defaultValue: false },
          { key: 'textOnlyChat', label: 'Text-based Chatbot Help (Coming Soon)', description: 'Access help through a real-time text chat instead of audio calls.', icon: Bot, type: 'boolean', defaultValue: false },
      ]
    },
    {
      id: 'motor',
      title: 'Motor Disability',
      subtitle: 'Hands-free Interaction',
      icon: Hand,
      iconColor: 'text-orange-500',
      features: [
          { key: 'voiceCommandNav', label: 'Voice Command Navigation (Coming Soon)', description: 'Control all aspects of the exam interface using your voice.', icon: Mic, type: 'boolean', defaultValue: false },
          { key: 'eyeTracking', label: 'Eye-tracking Control (Coming Soon)', description: 'Use your gaze to select options and navigate.', icon: MousePointer, type: 'boolean', defaultValue: false },
          { key: 'gestureRecognition', label: 'AI Gesture Recognition (Coming Soon)', description: 'Use simple head or hand gestures to control the interface.', icon: Hand, type: 'boolean', defaultValue: false },
          { key: 'autoSave', label: 'Auto-save Answers (Coming Soon)', description: 'Automatically saves your progress as you go.', icon: Save, type: 'boolean', defaultValue: false },
      ]
    },
    {
      id: 'sld',
      title: 'Specific Learning Disability',
      subtitle: 'Reading / Writing Aids',
      icon: BookOpen,
      iconColor: 'text-green-500',
      features: [
          { key: 'textSimplifier', label: 'AI Text Simplifier (Coming Soon)', description: 'Rephrases complex questions into simpler language.', icon: Zap, type: 'boolean', defaultValue: false },
          { key: 'dyslexiaFriendlyFont', label: 'Dyslexia-friendly Font', description: 'Switch to fonts designed for easier reading, like OpenDyslexic.', icon: Type, type: 'boolean', defaultValue: false },
          { key: 'handwritingMode', label: 'Handwriting Mode (Coming Soon)', description: 'Use a digital pen to write answers, which are converted to text.', icon: PenTool, type: 'boolean', defaultValue: false },
          { key: 'wordHighlighting', label: 'Word Highlighting (Coming Soon)', description: 'Focus on one word or line at a time as it\'s read aloud.', icon: TextSelect, type: 'boolean', defaultValue: false },
          { key: 'aiSpellCheck', label: 'AI Spell-check (Coming Soon)', description: 'Understands phonetic and dyslexic spelling patterns.', icon: SpellCheck, type: 'boolean', defaultValue: false },
      ]
    },
    {
      id: 'cognitive',
      title: 'Cognitive Disability',
      subtitle: 'Focus & Calm Experience',
      icon: Brain,
      iconColor: 'text-sky-500',
      features: [
          { key: 'focusMode', label: 'Focus Mode (Calm Visuals) (Coming Soon)', description: 'Removes all non-essential UI elements to help you focus.', icon: Focus, type: 'boolean', defaultValue: false },
          { key: 'stepByStep', label: 'Step-by-step Guidance (Coming Soon)', description: 'Breaks the exam into a one-question-at-a-time flow.', icon: Layout, type: 'boolean', defaultValue: false },
          { key: 'gentleTimeReminders', label: 'Gentle Time Reminders (Coming Soon)', description: 'Provides soft, non-intrusive reminders about remaining time.', icon: Clock, type: 'boolean', defaultValue: false },
          { key: 'simplifiedLanguage', label: 'Simplified Language (Coming Soon)', description: 'Uses simpler instructions and a cleaner interface.', icon: Heart, type: 'boolean', defaultValue: false },
      ]
    }
];
