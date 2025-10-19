'use client';
import { useState, useEffect } from 'react';
import { Eye, Ear, Hand, BookOpen, Brain, Volume2, Type, Mic, Headphones, Navigation, Focus, Heart, Zap } from 'lucide-react';

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
    voiceNavigation: false,
    handwritingRecognition: false,
    speechToText: false,
    audioOptimizer: false,
    
    // Hearing Assistance Settings
    realTimeCaptions: false,
    signLanguageAvatar: false,
    visualAlerts: false,
    chatbotMode: false,
    
    // Motor Assistance Settings
    voiceUIControl: false,
    eyeTracking: false,
    gestureRecognition: false,
    autoSave: false,
    predictiveText: false,
    nodBlinkSelection: false,
    
    // SLD Assistance Settings
    aiParaphrasing: false,
    dyslexiaFont: false,
    wordHighlighting: false,
    spellCorrection: false,
    readAloud: false,
    
    // Cognitive Support Settings
    calmTheme: false,
    guidedInterface: false,
    timeReminders: false,
    emotionAware: false,
    simplifiedLayout: false,
    progressTracking: false
  });

  const accessibilityModules = [
    {
      id: 'visual',
      title: 'Visual Assistance',
      icon: Eye,
      description: 'AI-powered visual support for enhanced clarity',
      dignityMessage: "We've fine-tuned your view for better clarity",
      bgColor: 'bg-gradient-to-r from-[#DDF7F5] to-[#C3F3EC]',
      iconColor: 'text-[#38C5B0]',
      features: [
        { key: 'textToSpeech', label: 'Smart Text-to-Speech', icon: Volume2 },
        { key: 'voiceNavigation', label: 'Voice Navigation', icon: Navigation },
        { key: 'handwritingRecognition', label: 'Handwriting Recognition', icon: Hand },
        { key: 'speechToText', label: 'Speech-to-Text Answers', icon: Mic },
        { key: 'audioOptimizer', label: 'AI Audio Optimizer', icon: Headphones }
      ]
    },
    {
      id: 'hearing',
      title: 'Hearing Assistance',
      icon: Ear,
      description: 'Visual communication and alert systems',
      dignityMessage: "We've optimized your communication experience",
      bgColor: 'bg-gradient-to-r from-[#EFE9FF] to-[#E0D4FF]',
      iconColor: 'text-[#8B5CF6]',
      features: [
        { key: 'realTimeCaptions', label: 'Real-time Captions', icon: Type },
        { key: 'signLanguageAvatar', label: 'Sign Language Avatar', icon: Hand },
        { key: 'visualAlerts', label: 'Visual Alerts', icon: Zap },
        { key: 'chatbotMode', label: 'Text-based Interaction', icon: Brain }
      ]
    },
    {
      id: 'motor',
      title: 'Motor Assistance',
      icon: Hand,
      description: 'Touch-free controls and smart automation',
      dignityMessage: "We've made your controls smoother and easier to use",
      bgColor: 'bg-gradient-to-r from-[#FFF1E4] to-[#FFEBD6]',
      iconColor: 'text-[#FF983B]',
      features: [
        { key: 'voiceUIControl', label: 'Voice UI Control', icon: Mic },
        { key: 'eyeTracking', label: 'Eye-tracking Navigation', icon: Eye },
        { key: 'gestureRecognition', label: 'Gesture Recognition', icon: Hand },
        { key: 'autoSave', label: 'Continuous Auto-save', icon: Zap },
        { key: 'predictiveText', label: 'Predictive Text Input', icon: Type },
        { key: 'nodBlinkSelection', label: 'Nod/Blink Selection', icon: Focus }
      ]
    },
    {
      id: 'sld',
      title: 'Learning Support',
      icon: BookOpen,
      description: 'AI-enhanced learning and comprehension tools',
      dignityMessage: "We've enhanced your learning experience",
      bgColor: 'bg-gradient-to-r from-[#E4F3FF] to-[#D6E9FF]',
      iconColor: 'text-[#3B82F6]',
      features: [
        { key: 'aiParaphrasing', label: 'AI Question Simplification', icon: Brain },
        { key: 'dyslexiaFont', label: 'Dyslexia-friendly Typography', icon: Type },
        { key: 'wordHighlighting', label: 'Word Highlighting', icon: Focus },
        { key: 'spellCorrection', label: 'Smart Spell Correction', icon: BookOpen },
        { key: 'readAloud', label: 'Read-aloud with Tracking', icon: Volume2 }
      ]
    },
    {
      id: 'cognitive',
      title: 'Cognitive Support',
      icon: Brain,
      description: 'Stress-free environment with gentle guidance',
      dignityMessage: "We've optimized your focus environment",
      bgColor: 'bg-gradient-to-r from-[#F0F9FF] to-[#E0F2FE]',
      iconColor: 'text-[#0EA5E9]',
      features: [
        { key: 'calmTheme', label: 'Calming Visual Theme', icon: Heart },
        { key: 'guidedInterface', label: 'Step-by-step Guidance', icon: Navigation },
        { key: 'timeReminders', label: 'Gentle Time Reminders', icon: Brain },
        { key: 'emotionAware', label: 'Emotion-aware AI Support', icon: Heart },
        { key: 'simplifiedLayout', label: 'Simplified Interface', icon: Focus },
        { key: 'progressTracking', label: 'Progress Visualization', icon: Zap }
      ]
    }
  ];

  // Auto-activate modules based on user profile
  useEffect(() => {
    if (userProfile?.accessibility_profile) {
      const profile = userProfile.accessibility_profile;
      
      // Silently activate appropriate modules
      const newActiveModules = { ...activeModules };
      const newSettings = { ...moduleSettings };

      if (profile.preferredSupport?.includes('visual')) {
        newActiveModules.visual = true;
        newSettings.textToSpeech = true;
        newSettings.voiceNavigation = true;
        newSettings.audioOptimizer = true;
      }

      if (profile.preferredSupport?.includes('hearing')) {
        newActiveModules.hearing = true;
        newSettings.realTimeCaptions = true;
        newSettings.visualAlerts = true;
        newSettings.chatbotMode = true;
      }

      if (profile.preferredSupport?.includes('motor')) {
        newActiveModules.motor = true;
        newSettings.voiceUIControl = true;
        newSettings.autoSave = true;
        newSettings.predictiveText = true;
      }

      if (profile.preferredSupport?.includes('sld')) {
        newActiveModules.sld = true;
        newSettings.aiParaphrasing = true;
        newSettings.dyslexiaFont = true;
        newSettings.spellCorrection = true;
      }

      if (profile.preferredSupport?.includes('cognitive')) {
        newActiveModules.cognitive = true;
        newSettings.calmTheme = true;
        newSettings.guidedInterface = true;
        newSettings.emotionAware = true;
      }

      setActiveModules(newActiveModules);
      setModuleSettings(newSettings);
      onSettingsUpdate?.(newSettings);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const toggleModule = (moduleId: keyof typeof activeModules) => {
    setActiveModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleFeature = (featureKey: keyof typeof moduleSettings) => {
    const newSettings = {
      ...moduleSettings,
      [featureKey]: !moduleSettings[featureKey]
    };
    setModuleSettings(newSettings);
    onSettingsUpdate?.(newSettings);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="font-poppins font-bold text-2xl lg:text-3xl text-foreground">
          Your Personalized AI Modules
        </h2>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          These intelligent features activate automatically to enhance your examination experience.
        </p>
      </div>

      {/* Active Modules Summary */}
      <div className="bg-card rounded-2xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat font-semibold text-lg text-foreground">
            Currently Active
          </h3>
          <span className="text-sm font-inter text-primary">
            {Object.values(activeModules).filter(Boolean).length} of 5 modules active
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {accessibilityModules.map((module) => {
            if (!activeModules[module.id]) return null;
            const IconComponent = module.icon;
            return (
              <div key={module.id} className={`${module.bgColor} px-4 py-2 rounded-full flex items-center space-x-2`}>
                <IconComponent className={`w-4 h-4 ${module.iconColor}`} />
                <span className="font-inter text-sm text-foreground">{module.title}</span>
              </div>
            );
          })}
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
                  : 'border-border hover:border-primary hover:shadow-md'
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
