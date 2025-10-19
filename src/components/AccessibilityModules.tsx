'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Ear, Hand, BookOpen, Brain, Volume2, Type, Mic, Headphones, Navigation, Focus, Heart, Zap, SpellCheck, Save, MousePointer, ScanEye, Bot, Palette, Layout, Clock, Presentation } from 'lucide-react';

export default function AccessibilityModules({ userProfile, onSettingsUpdate }: { userProfile?: any, onSettingsUpdate?: (settings: any) => void }) {
  const [activeModules, setActiveModules] = useState({
    visual: false,
    hearing: false,
    motor: false,
    sld: false,
    cognitive: false
  });

  const [moduleSettings, setModuleSettings] = useState({
    // Visual Assistance Settings
    textToSpeech: false,
    speechToText: false,
    voiceNavigation: false,
    audioOptimizer: false,
    handwritingRecognition: false,
    
    // Hearing Assistance Settings
    realTimeCaptions: false,
    signLanguageAvatar: false,
    visualAlerts: false,
    chatbotHelp: false,
    
    // Motor Assistance Settings
    voiceCommandNavigation: false,
    eyeTracking: false,
    gestureRecognition: false,
    autoSave: false,
    predictiveText: false,
    
    // SLD Assistance Settings
    aiTextSimplifier: false,
    dyslexiaFriendlyFont: false,
    wordHighlighting: false,
    aiSpellCheck: false,
    readAloud: false,
    
    // Cognitive Support Settings
    focusMode: false,
    guidedNavigation: false,
    timeReminders: false,
    emotionAwareAgent: false,
    simplifiedLayout: false,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const accessibilityModules = [
    {
      id: 'visual',
      title: 'Visual Assistance',
      icon: Eye,
      description: 'AI-powered visual support for enhanced clarity',
      dignityMessage: "We've fine-tuned your view for better clarity",
      bgColor: 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50',
      iconColor: 'text-blue-500',
      features: [
        { key: 'textToSpeech', label: 'Text-to-Speech (TTS)', icon: Volume2 },
        { key: 'speechToText', label: 'Speech-to-Text (STT)', icon: Mic },
        { key: 'voiceNavigation', label: 'Voice Navigation', icon: Navigation },
        { key: 'audioOptimizer', label: 'AI Audio Optimizer', icon: Headphones },
        { key: 'handwritingRecognition', label: 'Handwriting Recognition', icon: Hand },
      ]
    },
    {
      id: 'hearing',
      title: 'Hearing Assistance',
      icon: Ear,
      description: 'Visual communication and alert systems',
      dignityMessage: "We've optimized your communication experience",
      bgColor: 'bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50',
      iconColor: 'text-purple-500',
      features: [
        { key: 'realTimeCaptions', label: 'Real-time Captions', icon: Type },
        { key: 'signLanguageAvatar', label: 'AI Sign Language Avatar', icon: Presentation },
        { key: 'visualAlerts', label: 'Visual Pop-up Alerts', icon: Zap },
        { key: 'chatbotHelp', label: 'Text-based Chatbot Help', icon: Bot }
      ]
    },
    {
      id: 'motor',
      title: 'Motor Disabilities',
      icon: Hand,
      description: 'Touch-free controls and smart automation',
      dignityMessage: "We've made your controls smoother and easier to use",
      bgColor: 'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50',
      iconColor: 'text-orange-500',
      features: [
        { key: 'voiceCommandNavigation', label: 'Voice Command Navigation', icon: Mic },
        { key: 'eyeTracking', label: 'Eye-tracking Control', icon: ScanEye },
        { key: 'gestureRecognition', label: 'AI Gesture Recognition', icon: Hand },
        { key: 'autoSave', label: 'Auto-save Answers', icon: Save },
        { key: 'predictiveText', label: 'Predictive Typing', icon: Type },
      ]
    },
    {
      id: 'sld',
      title: 'Learning Disabilities',
      icon: BookOpen,
      description: 'AI-enhanced learning and comprehension tools',
      dignityMessage: "We've enhanced your learning experience",
      bgColor: 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50',
      iconColor: 'text-green-500',
      features: [
        { key: 'aiTextSimplifier', label: 'AI Text Simplifier', icon: Brain },
        { key: 'dyslexiaFriendlyFont', label: 'Dyslexia-friendly Fonts', icon: Type },
        { key: 'wordHighlighting', label: 'Word Highlighting', icon: Focus },
        { key: 'aiSpellCheck', label: 'AI Spell-check', icon: SpellCheck },
        { key: 'readAloud', label: 'Read-aloud Support', icon: Volume2 }
      ]
    },
    {
      id: 'cognitive',
      title: 'Cognitive Disabilities',
      icon: Brain,
      description: 'Stress-free environment with gentle guidance',
      dignityMessage: "We've optimized your focus environment",
      bgColor: 'bg-gradient-to-r from-sky-100 to-sky-200 dark:from-sky-900/50 dark:to-sky-800/50',
      iconColor: 'text-sky-500',
      features: [
        { key: 'focusMode', label: 'Focus Mode (Calm Visuals)', icon: Palette },
        { key: 'guidedNavigation', label: 'Step-by-step Guidance', icon: MousePointer },
        { key: 'timeReminders', label: 'Gentle Time Reminders', icon: Clock },
        { key: 'emotionAwareAgent', label: 'Emotion-aware AI Agent', icon: Heart },
        { key: 'simplifiedLayout', label: 'Simplified Layout', icon: Layout },
      ]
    }
  ];

  // Load initial state from user profile
  useEffect(() => {
    if (userProfile?.accessibility_profile) {
      const profile = userProfile.accessibility_profile;
      
      const newActiveModules = {
        visual: !!profile.visual,
        hearing: !!profile.hearing,
        motor: !!profile.motor,
        sld: !!profile.sld,
        cognitive: !!profile.cognitive,
      };
      
      const newSettings: { [key: string]: boolean } = {};
      accessibilityModules.forEach(module => {
        module.features.forEach(feature => {
            newSettings[feature.key] = !!profile[feature.key as keyof typeof profile];
        });
      });
      
      setActiveModules(newActiveModules);
      setModuleSettings(newSettings as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const finalSettings = {
        ...activeModules,
        ...moduleSettings,
    };
    await onSettingsUpdate?.(finalSettings);
    setIsSaving(false);
  };

  const toggleModule = (moduleId: keyof typeof activeModules) => {
    setActiveModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleFeature = (featureKey: keyof typeof moduleSettings) => {
    setModuleSettings(prev => ({
      ...prev,
      [featureKey]: !prev[featureKey]
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="font-poppins font-bold text-2xl lg:text-3xl text-foreground">
          Your Personalized AI Modules
        </h2>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          These intelligent features activate automatically to enhance your examination experience. You can customize them below.
        </p>
      </div>

      {/* Active Modules Summary */}
      <div className="bg-card rounded-2xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-semibold text-lg text-foreground">
            Currently Active
          </h3>
          <span className="text-sm font-inter text-primary">
            {Object.values(activeModules).filter(Boolean).length} of {accessibilityModules.length} modules active
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {accessibilityModules.map((module) => {
            if (!activeModules[module.id as keyof typeof activeModules]) return null;
            const IconComponent = module.icon;
            return (
              <div key={module.id} className={`${module.bgColor} px-4 py-2 rounded-full flex items-center space-x-2`}>
                <IconComponent className={`w-4 h-4 ${module.iconColor}`} />
                <span className="font-inter text-sm text-foreground">{module.title}</span>
              </div>
            );
          })}
           {Object.values(activeModules).filter(Boolean).length === 0 && (
                <p className="text-sm text-muted-foreground">No modules active. Select one below to get started.</p>
           )}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {accessibilityModules.map((module) => {
          const IconComponent = module.icon;
          const isActive = activeModules[module.id as keyof typeof activeModules];
          
          return (
            <div
              key={module.id}
              className={`bg-card rounded-2xl p-6 border transition-all duration-300 ${
                isActive 
                  ? 'border-primary shadow-lg' 
                  : 'border-border hover:border-primary/80 hover:shadow-md'
              }`}
            >
              {/* Module Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${module.bgColor} rounded-xl flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${module.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-semibold text-lg text-foreground">
                      {module.title}
                    </h3>
                    <p className="font-inter text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleModule(module.id as keyof typeof activeModules)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    isActive ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                    isActive ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Dignity Message */}
              {isActive && (
                <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                  <p className="font-inter text-sm text-foreground">
                    ✨ {module.dignityMessage}
                  </p>
                </div>
              )}

              {/* Features List */}
              {isActive && (
                <div className="space-y-3">
                  <h4 className="font-inter font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Features
                  </h4>
                  {module.features.map((feature) => {
                    const FeatureIcon = feature.icon;
                    const isFeatureActive = moduleSettings[feature.key as keyof typeof moduleSettings];
                    
                    return (
                      <div
                        key={feature.key}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                        onClick={() => toggleFeature(feature.key as keyof typeof moduleSettings)}
                      >
                        <div className="flex items-center space-x-3">
                          <FeatureIcon className={`w-4 h-4 ${
                            isFeatureActive ? module.iconColor : 'text-muted-foreground'
                          }`} />
                          <span className={`font-inter text-sm ${
                            isFeatureActive 
                              ? 'text-foreground font-medium' 
                              : 'text-muted-foreground'
                          }`}>
                            {feature.label}
                          </span>
                        </div>
                        
                        <div className={`w-4 h-4 rounded border-2 transition-colors duration-200 ${
                          isFeatureActive 
                            ? 'bg-primary border-primary' 
                            : 'border-border'
                        }`}>
                          {isFeatureActive && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
       <div className="text-center p-6 bg-card rounded-2xl border flex justify-center">
        <Button onClick={handleSaveSettings} disabled={isSaving} size="lg">
            {isSaving ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? "Saving..." : "Save My Preferences"}
        </Button>
      </div>

      {/* AI Status */}
      <div className="text-center p-6 bg-primary/10 rounded-2xl border border-primary/20">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <span className="font-inter text-sm text-foreground font-medium">
            AI Accessibility Engine Active
          </span>
        </div>
        <p className="font-inter text-sm text-muted-foreground">
          Continuously adapting to provide the best examination experience
        </p>
      </div>
    </div>
  );
}
