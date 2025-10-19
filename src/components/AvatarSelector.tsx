'use client';

import { avatars, type Avatar } from '@/lib/avatars';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface AvatarSelectorProps {
  currentAvatarUrl: string;
  onSelect: (url: string) => void;
}

export function AvatarSelector({ currentAvatarUrl, onSelect }: AvatarSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a new avatar from the selection below.
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
        {avatars.map((avatar) => {
          const isSelected = currentAvatarUrl === avatar.url;
          return (
            <div
              key={avatar.id}
              className="relative cursor-pointer"
              onClick={() => onSelect(avatar.url)}
            >
              <Image
                src={avatar.url}
                alt={`Avatar ${avatar.id}`}
                width={128}
                height={128}
                className={cn(
                  'rounded-full w-full h-auto aspect-square object-cover border-2 transition-all',
                  isSelected
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-transparent hover:border-primary/50'
                )}
              />
              {isSelected && (
                <div className="absolute top-0 right-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
