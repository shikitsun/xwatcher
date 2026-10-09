import { badgeText } from '@videojs/core/i18n/text/live';
import { Text as TextPrimitive } from '@videojs/react';
import { LiveButton as LiveButtonPrimitive } from '@videojs/react';

import { cn } from '@/lib/utils';

import { Button } from './button';

export function LiveButton() {
  return (
    <LiveButtonPrimitive
      render={<Button />}
      className={
        'group/live grid-flow-col w-auto! items-center gap-1.5 px-2.5! text-media-sm font-semibold uppercase tracking-wider'
      }
    >
      <div
        aria-hidden="true"
        className={cn(
          'inline-block size-2 shrink-0 rounded-media-pill bg-current opacity-40 transition-[background-color,opacity] duration-media-base ease-out motion-reduce:transition-none',
          'group-data-live-edge/live:bg-[#f43f5e] group-data-live-edge/live:opacity-100'
        )}
      />
      <TextPrimitive token={badgeText.key}>{badgeText.text}</TextPrimitive>
    </LiveButtonPrimitive>
  );
}
