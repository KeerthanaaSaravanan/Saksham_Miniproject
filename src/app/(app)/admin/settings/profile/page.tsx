import ProfileSettingsPage from '@/app/(app)/settings/profile/page';

// This is a route-specific re-export to ensure the faculty profile
// is rendered under the /admin/settings/profile path.
// The underlying component uses the path to determine which UI to show.
export default ProfileSettingsPage;
