
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Save } from 'lucide-react';
import { accessibilityModules } from './accessibility/modules';
import { useAccessibilityPanel } from './accessibility/accessibility-panel-provider';

export default function AccessibilityModules() {
  const { userProfile, handleSettingsUpdate } = useAccessibilityPanel();
  const [moduleSettings, setModuleSettings] = useState<{[key: string]: boolean}>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Load initial state from the provider
  useEffect(() => {
    if (userProfile?.accessibility_profile) {
      setModuleSettings(userProfile.accessibility_profile as any);
    }
  }, [userProfile]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await handleSettingsUpdate?.(moduleSettings);
    setIsSaving(false);
  };

  const toggleFeature = (featureKey: keyof typeof moduleSettings) => {
    setModuleSettings(prev => ({
      ...prev,
      [featureKey]: !prev[featureKey]
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="font-poppins font-bold text-2xl lg:text-3xl text-foreground">
          Accessibility Customization
        </h2>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the specific AI-powered features you need for a truly personalized exam experience.
        </p>
      </div>

      <div className="space-y-8">
        {accessibilityModules.map((module) => {
          const IconComponent = module.icon;
          
          return (
            <Card key={module.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                    <div className="flex items-center gap-4">
                        <IconComponent className={`h-6 w-6 ${module.iconColor}`} />
                        <div>
                            <CardTitle>{module.title}</CardTitle>
                            <CardDescription>{module.subtitle}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {module.features.map((feature) => {
                        const FeatureIcon = feature.icon;
                        const isChecked = moduleSettings[feature.key as keyof typeof moduleSettings] || false;
                        const isDisabled = feature.label.includes('(Coming Soon)');

                        return (
                        <div key={feature.key} className="flex items-center space-x-3">
                            <Checkbox 
                                id={feature.key}
                                checked={isChecked && !isDisabled}
                                onCheckedChange={() => toggleFeature(feature.key as keyof typeof moduleSettings)}
                                disabled={isDisabled}
                            />
                            <Label htmlFor={feature.key} className={`flex items-center gap-2 ${isDisabled ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}>
                                <FeatureIcon className="h-4 w-4" />
                                <span>{feature.label}</span>
                            </Label>
                        </div>
                        );
                    })}
                </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center p-6 bg-card rounded-2xl border flex justify-center">
        <Button onClick={handleSaveSettings} disabled={isSaving} size="lg">
            {isSaving ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? "Saving..." : "Save My Preferences"}
        </Button>
      </div>
    </div>
  );
}
