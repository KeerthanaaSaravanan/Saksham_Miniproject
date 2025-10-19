export type Avatar = {
  id: string;
  url: string;
  tags: ('landscape' | 'abstract')[];
};

// Using high-quality landscape photos from picsum.photos
export const avatars: Avatar[] = [
  { id: 'l1', url: 'https://picsum.photos/seed/l1/200', tags: ['landscape'] },
  { id: 'l2', url: 'https://picsum.photos/seed/l2/200', tags: ['landscape'] },
  { id: 'l3', url: 'https://picsum.photos/seed/l3/200', tags: ['landscape'] },
  { id: 'l4', url: 'https://picsum.photos/seed/l4/200', tags: ['landscape'] },
  { id: 'l5', url: 'https://picsum.photos/seed/l5/200', tags: ['landscape'] },
  { id: 'l6', url: 'https://picsum.photos/seed/l6/200', tags: ['landscape'] },
  { id: 'a1', url: 'https://picsum.photos/seed/a1/200', tags: ['abstract'] },
  { id: 'a2', url: 'https://picsum.photos/seed/a2/200', tags: ['abstract'] },
  { id: 'a3', url: 'https://picsum.photos/seed/a3/200', tags: ['abstract'] },
  { id: 'a4', url: 'https://picsum.photos/seed/a4/200', tags: ['abstract'] },
  { id: 'a5', url: 'https://picsum.photos/seed/a5/200', tags: ['abstract'] },
  { id: 'a6', url: 'https://picsum.photos/seed/a6/200', tags: ['abstract'] },
];
