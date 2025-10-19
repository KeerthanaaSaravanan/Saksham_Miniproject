export type Avatar = {
  id: string;
  url: string;
  tags: ('male' | 'female' | 'common')[];
};

// Using picsum.photos with specific seeds for consistent "AI-generated" placeholders.
export const avatars: Avatar[] = [
  // Male Avatars
  { id: 'm1', url: 'https://picsum.photos/seed/avatar_m1/128/128', tags: ['male'] },
  { id: 'm2', url: 'https://picsum.photos/seed/avatar_m2/128/128', tags: ['male'] },
  { id: 'm3', url: 'https://picsum.photos/seed/avatar_m3/128/128', tags: ['male'] },
  { id: 'm4', url: 'https://picsum.photos/seed/avatar_m4/128/128', tags: ['male'] },
  { id: 'm5', url: 'https://picsum.photos/seed/avatar_m5/128/128', tags: ['male'] },
  // Female Avatars
  { id: 'f1', url: 'https://picsum.photos/seed/avatar_f1/128/128', tags: ['female'] },
  { id: 'f2', url: 'https://picsum.photos/seed/avatar_f2/128/128', tags: ['female'] },
  { id: 'f3', url: 'https://picsum.photos/seed/avatar_f3/128/128', tags: ['female'] },
  { id: 'f4', url: 'https://picsum.photos/seed/avatar_f4/128/128', tags: ['female'] },
  { id: 'f5', url: 'https://picsum.photos/seed/avatar_f5/128/128', tags: ['female'] },
  // Common Avatars
  { id: 'c1', url: 'https://picsum.photos/seed/avatar_c1/128/128', tags: ['common'] },
  { id: 'c2', url: 'https://picsum.photos/seed/avatar_c2/128/128', tags: ['common'] },
];
