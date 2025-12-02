
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
    }
];
