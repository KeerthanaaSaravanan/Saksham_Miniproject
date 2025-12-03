
import {
  Eye, Ear, Hand, BookOpen, Brain, Volume2, Mic, Navigation, Type, Presentation, Zap, Bot,
  ScanEye, Save, SpellCheck, Focus, Palette, Layout, Clock, Heart, MousePointer, CaseUpper, PenTool, TextSelect, MessageSquare, Video, FileText
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type FeatureType = 'boolean' | 'radio' | 'slider';

export interface AccessibilityFeature {
    key: string;
    label: string;
    description?: string;
    icon: LucideIcon;
    type: FeatureType;
    defaultValue: string | boolean | number;
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
        { key: 'highContrast', label: 'High Contrast Mode', description: 'Choose a high-contrast theme for better readability.', icon: Palette, type: 'radio', defaultValue: 'off', options: [
            { value: 'off', label: 'Off' },
            { value: 'white-on-black', label: 'White on Black' },
            { value: 'black-on-white', label: 'Black on White' },
            { value: 'yellow-on-black', label: 'Yellow on Black' },
        ]},
        { key: 'textSize', label: 'Text Size', description: 'Increase the font size across the application.', icon: CaseUpper, type: 'slider', defaultValue: 16 },
      ]
    },
    {
      id: 'sld',
      title: 'Specific Learning Disability',
      subtitle: 'Reading / Writing Aids',
      icon: BookOpen,
      iconColor: 'text-green-500',
      features: [
          { key: 'dyslexiaFriendlyFont', label: 'Dyslexia-friendly Font', description: 'Switch to fonts designed for easier reading, like OpenDyslexic.', icon: Type, type: 'boolean', defaultValue: false },
          { key: 'textSimplifier', label: 'AI Text Simplifier (Coming Soon)', description: 'Rephrases complex questions into simpler language.', icon: Zap, type: 'radio', defaultValue: 'off', options: [
              { value: 'off', label: 'Off' },
              { value: 'grade_4', label: 'Grade 4 Level' },
              { value: 'grade_6', label: 'Grade 6 Level' },
              { value: 'grade_8', label: 'Grade 8 Level' },
          ]},
          { key: 'wordHighlighting', label: 'Word Highlighting (Coming Soon)', description: 'Focus on one word or line at a time as it\'s read aloud.', icon: TextSelect, type: 'boolean', defaultValue: false },
          { key: 'aiSpellCheck', label: 'AI Spell-check (Coming Soon)', description: 'Understands phonetic and dyslexic spelling patterns.', icon: SpellCheck, type: 'boolean', defaultValue: false },
      ]
    }
];
