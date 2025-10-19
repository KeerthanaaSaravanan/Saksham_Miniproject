export type Avatar = {
  id: string;
  url: string;
  tags: ('male' | 'female' | 'common')[];
};

// Using high-quality 3D avatars
export const avatars: Avatar[] = [
  // Male Avatars
  { id: 'm1', url: 'https://i.ibb.co/ckT3nJc/m1.png', tags: ['male'] },
  { id: 'm2', url: 'https://i.ibb.co/3sSjJ2D/m2.png', tags: ['male'] },
  { id: 'm3', url: 'https://i.ibb.co/C9tD1Ff/m3.png', tags: ['male'] },
  { id: 'm4', url: 'https://i.ibb.co/M600T7T/m4.png', tags: ['male'] },
  { id: 'm5', url: 'https://i.ibb.co/cN7wWz8/m5.png', tags: ['male'] },
  // Female Avatars
  { id: 'f1', url: 'https://i.ibb.co/VvzV16L/f1.png', tags: ['female'] },
  { id: 'f2', url: 'https://i.ibb.co/vYd92yT/f2.png', tags: ['female'] },
  { id: 'f3', url: 'https://i.ibb.co/y4L2zC5/f3.png', tags: ['female'] },
  { id: 'f4', url: 'https://i.ibb.co/fHnN0X4/f4.png', tags: ['female'] },
  { id: 'f5', url: 'https://i.ibb.co/k2x2xG6/f5.png', tags: ['female'] },
  // Common Avatars
  { id: 'c1', url: 'https://i.ibb.co/W2LzQ1W/c1.png', tags: ['common'] },
  { id: 'c2', url: 'https://i.ibb.co/tZ5L6gL/c2.png', tags: ['common'] },
];
