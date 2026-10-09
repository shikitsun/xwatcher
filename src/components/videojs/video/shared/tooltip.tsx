import { Tooltip } from '@videojs/react';
import type { ClassValue } from 'cn';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function ButtonTooltip({
  children,
  delay,
  disabled,
  label,
  popupClassName,
  sticky,
}: {
  children: ReactElement;
  delay?: number;
  disabled?: boolean;
  label?: ReactNode;
  popupClassName?: ClassValue;
  sticky?: boolean;
}) {
  return (
    <Tooltip.Root delay={delay} disabled={disabled} side="top" sticky={sticky}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Popup
        className={cn(
          'm-0 overflow-visible border-0 text-inherit',
          'media-transitioning:opacity-0 media-transitioning:blur-media-hidden-popup media-transitioning:scale-media-hidden-popup',
          'data-[side=top]:origin-bottom data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left',
          'data-[side=top]:[--media-popup-translate-y-distance:var(--media-popup-translate-distance)]',
          'data-[side=bottom]:[--media-popup-translate-y-distance:calc(var(--media-popup-translate-distance)*-1)]',
          'data-[side=left]:[--media-popup-translate-x-distance:var(--media-popup-translate-distance)]',
          'data-[side=right]:[--media-popup-translate-x-distance:calc(var(--media-popup-translate-distance)*-1)]',
          'media-transitioning:scale-none!',
          'data-starting-style:transform-[translate(var(--media-popup-translate-x-distance,0),var(--media-popup-translate-y-distance,0))_scale(var(--media-hidden-popup-scale))]',
          'data-ending-style:transform-[scale(var(--media-hidden-popup-scale))]',
          'before:pointer-events-auto before:absolute',
          'data-[side=top]:before:inset-x-0 data-[side=top]:before:top-full',
          'data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:bottom-full',
          'data-[side=left]:before:inset-y-0 data-[side=left]:before:left-full',
          'data-[side=right]:before:inset-y-0 data-[side=right]:before:right-full',
          'data-[side=top]:before:h-(--media-popup-side-offset) data-[side=bottom]:before:h-(--media-popup-side-offset)',
          'data-[side=left]:before:w-(--media-popup-side-offset) data-[side=right]:before:w-(--media-popup-side-offset)',
          'transition-media-popup data-ending-style:duration-media-instant',
          'pointer-events-none z-20 whitespace-nowrap rounded-md bg-media-popover px-1.5 py-0.5 text-media-popover-foreground',
          'surface-media [--media-popup-side-offset:var(--media-tooltip-side-offset)] [--media-tooltip-side-offset:calc(var(--media-spacing)*6)]',
          'data-open:flex data-open:items-center data-open:gap-1',
          'media-high-contrast:outline forced-colors:outline',
          popupClassName
        )}
      >
        {label ?? <Tooltip.Label />}
        {!label && (
          <Tooltip.Shortcut
            className={cn(
              'min-w-[1.5em] rounded-sm bg-media-muted p-[0.1em] -me-0.5 text-center text-media-sm [font-family:inherit] font-semibold leading-tight',
              'forced-colors:bg-black forced-colors:text-white forced-colors:forced-color-adjust-none'
            )}
          />
        )}
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}
