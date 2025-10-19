'use client';

import AccessibilityModules from '@/components/AccessibilityModules';

export default function AccessibilitySettingsPage() {
    
    const handleSettingsUpdate = (settings: any) => {
        console.log("Accessibility settings updated:", settings);
        // Here you would typically save the settings to a user profile in your backend
    };

    // Mock user profile. In a real app, this would come from your authentication context.
    const mockUserProfile = {
        accessibility_profile: {
            preferredSupport: ['visual', 'sld']
        }
    };

    return (
        <div className="container mx-auto py-6">
            <AccessibilityModules 
                userProfile={mockUserProfile}
                onSettingsUpdate={handleSettingsUpdate}
            />
        </div>
    );
}
