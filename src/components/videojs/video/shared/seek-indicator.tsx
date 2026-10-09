import { SeekIndicator as SeekIndicatorPrimitive } from '@videojs/react';
import { ChevronIcon as ChevronIconPrimitive } from '@videojs/react/icons/compat';

import { cn } from '@/lib/utils';

/** Feedback for the arrow-key and double-tap seeks, shown on the side it seeks towards. */
export function SeekIndicator() {
  return (
    <SeekIndicatorPrimitive.Root
      className={cn(
        'pointer-events-none flex items-center gap-2 rounded-md bg-[rgba(0,0,0,0.5)] px-2.5 py-1',
        'media-high-contrast:bg-media-background media-high-contrast:outline media-high-contrast:outline-current',
        'forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:outline forced-colors:outline-[CanvasText]',
        'transition-[opacity,transform] duration-media-base ease-out data-starting-style:opacity-0 data-ending-style:opacity-0',
        'motion-safe:data-starting-style:transform-[scale(0.95)] motion-safe:data-ending-style:transform-[scale(0.95)]',
        'motion-reduce:transition-none',
        'group/seek-status col-start-2 row-start-1 mx-3 flex-col justify-center gap-1!',
        'bg-transparent! media-high-contrast:bg-transparent! forced-colors:bg-transparent!',
        'data-[direction=backward]:col-start-1 data-[direction=backward]:justify-self-start rtl:data-[direction=backward]:col-start-3 rtl:data-[direction=backward]:justify-self-end',
        'data-[direction=forward]:col-start-3 data-[direction=forward]:justify-self-end rtl:data-[direction=forward]:col-start-1 rtl:data-[direction=forward]:justify-self-start'
      )}
    >
      <ChevronIconPrimitive className={'size-4.5 group-data-[direction=backward]/seek-status:transform-[scaleX(-1)]'} />
      <SeekIndicatorPrimitive.Value className={'tabular-nums'} />
    </SeekIndicatorPrimitive.Root>
  );
}
