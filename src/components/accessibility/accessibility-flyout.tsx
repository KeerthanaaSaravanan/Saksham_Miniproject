

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccessibilityModule } from './modules';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useAccessibilityPanel } from './accessibility-panel-provider';
import { Slider } from '../ui/slider';

interface AccessibilityFlyoutProps {
    module: AccessibilityModule;
    isOpen: boolean;
    onClose: () => void;
}

export function AccessibilityFlyout({ module, isOpen, onClose }: AccessibilityFlyoutProps) {
  const { userProfile, handleSettingsUpdate } = useAccessibilityPanel();
  const [moduleSettings, setModuleSettings] = useState<{[key: string]: any}>({});
  const [isSaving, setIsSaving] = useState(false);
  const IconComponent = module.icon;

  useEffect(() => {
    const profile = userProfile?.accessibility_profile || {};
    const newSettings: { [key: string]: any } = {};
      module.features.forEach(feature => {
        newSettings[feature.key] = profile[feature.key] ?? feature.defaultValue;
      });
      setModuleSettings(newSettings);
  }, [userProfile, module.features]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // We need to merge with existing settings from other modules
    const fullSettings = { ...(userProfile?.accessibility_profile || {}), ...moduleSettings };
    await handleSettingsUpdate(fullSettings);
    setIsSaving(false);
    onClose();
  };

  const updateSetting = (key: string, value: any) => {
    setModuleSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-24 z-50">
      <Card className="w-[400px] h-[600px] flex flex-col shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2">
        <CardHeader className="border-b flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <IconComponent className={cn("h-6 w-6", module.iconColor)} />
              <div>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.subtitle}</CardDescription>
              </div>
            </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-6 space-y-6 overflow-y-auto">
          {module.features.map((feature) => {
              const FeatureIcon = feature.icon;
              const currentValue = moduleSettings[feature.key];
              const isDisabled = feature.label.includes('(Coming Soon)');

              return (
              <div key={feature.key} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 flex items-start gap-3">
                      <FeatureIcon className="h-5 w-5 mt-1" />
                      <div className='flex-1'>
                        <p className="font-semibold">{feature.label}</p>
                        {feature.description && <p className="text-xs text-muted-foreground font-normal">{feature.description}</p>}
                         {feature.type === 'radio' && feature.options && (
                             <RadioGroup
                                value={currentValue}
                                onValueChange={(val) => updateSetting(feature.key, val)}
                                className="mt-2"
                                disabled={isDisabled}
                            >
                                {feature.options.map(opt => (
                                    <div key={opt.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt.value} id={`${feature.key}-${opt.value}`} />
                                        <Label htmlFor={`${feature.key}-${opt.value}`}>{opt.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                        {feature.type === 'slider' && (
                          <div className="pt-2">
                            <Slider
                              min={14}
                              max={32}
                              step={2}
                              defaultValue={[currentValue || 16]}
                              onValueChange={(value) => updateSetting(feature.key, value[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>14px</span>
                              <span>{currentValue || 16}px</span>
                              <span>32px</span>
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                   {feature.type === 'boolean' && (
                     <Checkbox 
                        id={feature.key}
                        checked={currentValue && !isDisabled}
                        onCheckedChange={(checked) => updateSetting(feature.key, !!checked)}
                        disabled={isDisabled}
                        className="mt-1"
                    />
                  )}
              </div>
              );
          })}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
