import { Controls } from '@videojs/react';

import { cn } from '@/lib/utils';

import { SeekButton } from './shared/seek-button';
import { SettingsMenu } from './shared/settings-menu';
import type { ThumbnailSlot } from './shared/time-slider';
import { VideoControlsContent } from './shared/video-controls';

export function VideoControls({ renderThumbnail }: ThumbnailSlot = {}) {
  return (
    <Controls.Root>
      <VideoControlsContent
        center
        menu={<SettingsMenu />}
        renderThumbnail={renderThumbnail}
        seekBackward={
          <SeekButton
            className={cn(
              'bg-[rgba(0,0,0,0.4)]! media-high-contrast:bg-media-background! forced-colors:bg-[ButtonFace]!',
              'hover:bg-[rgba(0,0,0,0.85)]! focus-visible:bg-[rgba(0,0,0,0.85)]! aria-expanded:bg-[rgba(0,0,0,0.85)]!',
              'media-high-contrast:hover:bg-media-foreground! media-high-contrast:focus-visible:bg-media-foreground! media-high-contrast:aria-expanded:bg-media-foreground!',
              'forced-colors:hover:bg-[Highlight]! forced-colors:focus-visible:bg-[Highlight]! forced-colors:aria-expanded:bg-[Highlight]!',
              'hidden size-9! pointer-fine:grid'
            )}
            iconClassName={'size-4.5'}
            seconds={-10}
            tooltip={false}
          />
        }
        seekForward={
          <SeekButton
            className={cn(
              'bg-[rgba(0,0,0,0.4)]! media-high-contrast:bg-media-background! forced-colors:bg-[ButtonFace]!',
              'hover:bg-[rgba(0,0,0,0.85)]! focus-visible:bg-[rgba(0,0,0,0.85)]! aria-expanded:bg-[rgba(0,0,0,0.85)]!',
              'media-high-contrast:hover:bg-media-foreground! media-high-contrast:focus-visible:bg-media-foreground! media-high-contrast:aria-expanded:bg-media-foreground!',
              'forced-colors:hover:bg-[Highlight]! forced-colors:focus-visible:bg-[Highlight]! forced-colors:aria-expanded:bg-[Highlight]!',
              'hidden size-9! pointer-fine:grid'
            )}
            iconClassName={'size-4.5'}
            seconds={10}
            tooltip={false}
          />
        }
      />
    </Controls.Root>
  );
}
