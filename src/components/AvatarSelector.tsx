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
    <div className="space-y-4 w-full">
      <p className="text-sm text-muted-foreground text-center">
        Choose a new avatar from the selection below.
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {avatars.map((avatar) => {
          const isSelected = currentAvatarUrl === avatar.url;
          return (
            <div
              key={avatar.id}
              className="relative cursor-pointer group"
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
                    : 'border-transparent group-hover:border-primary/50'
                )}
              />
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
