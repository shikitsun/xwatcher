import {
  StatusIndicator as StatusIndicatorPrimitive,
  VolumeIndicator as VolumeIndicatorPrimitive,
} from '@videojs/react';
import {
  CaptionsOnIcon as CaptionsOnIconPrimitive,
  CaptionsOffIcon as CaptionsOffIconPrimitive,
  FullscreenEnterIcon as FullscreenEnterIconPrimitive,
  FullscreenExitIcon as FullscreenExitIconPrimitive,
  PipEnterIcon as PipEnterIconPrimitive,
  PipExitIcon as PipExitIconPrimitive,
  VolumeHighIcon as VolumeHighIconPrimitive,
  VolumeLowIcon as VolumeLowIconPrimitive,
  VolumeOffIcon as VolumeOffIconPrimitive,
} from '@videojs/react/icons/compat';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const STATUS_ACTIONS = ['toggleSubtitles', 'toggleFullscreen', 'togglePictureInPicture'] as const;

/**
 * Transient feedback stacks above the title and below the controls, and never takes pointer input. The whole group is
 * hidden from assistive technology: `StatusAnnouncer` already speaks these same events, so exposing both would announce
 * every one of them twice.
 */
export function Indicators({ children }: { children?: ReactNode } = {}) {
  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute inset-0 z-20 grid grid-cols-3 items-center justify-items-center forced-colors:z-40'
      }
    >
      <VolumeIndicator />
      <StatusIndicator />
      {children}
    </div>
  );
}

function StatusIndicator() {
  return (
    <StatusIndicatorPrimitive.Root
      actions={STATUS_ACTIONS}
      className={cn(
        'pointer-events-none flex items-center gap-2 rounded-md bg-[rgba(0,0,0,0.5)] px-2.5 py-1',
        'media-high-contrast:bg-media-background media-high-contrast:outline media-high-contrast:outline-current',
        'forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:outline forced-colors:outline-[CanvasText]',
        'transition-[opacity,transform] duration-media-base ease-out data-starting-style:opacity-0 data-ending-style:opacity-0',
        'motion-safe:data-starting-style:transform-[scale(0.95)] motion-safe:data-ending-style:transform-[scale(0.95)]',
        'motion-reduce:transition-none',
        'group/input-status col-start-2 row-start-1 self-start mt-3'
      )}
    >
      <CaptionsOnIconPrimitive
        className={cn('hidden size-4.5 shrink-0', 'group-data-[status=captions-on]/input-status:block')}
      />
      <CaptionsOffIconPrimitive
        className={cn('hidden size-4.5 shrink-0', 'group-data-[status=captions-off]/input-status:block')}
      />
      <FullscreenEnterIconPrimitive
        className={cn('hidden size-4.5 shrink-0', 'group-data-[status=fullscreen]/input-status:block')}
      />
      <FullscreenExitIconPrimitive
        className={cn('hidden size-4.5 shrink-0', 'group-data-[status=exit-fullscreen]/input-status:block')}
      />
      <PipEnterIconPrimitive className={cn('hidden size-4.5 shrink-0', 'group-data-[status=pip]/input-status:block')} />
      <PipExitIconPrimitive
        className={cn('hidden size-4.5 shrink-0', 'group-data-[status=exit-pip]/input-status:block')}
      />
      <StatusIndicatorPrimitive.Value />
    </StatusIndicatorPrimitive.Root>
  );
}

function VolumeIndicator() {
  return (
    <VolumeIndicatorPrimitive.Root
      className={cn(
        'pointer-events-none flex items-center gap-2 rounded-md bg-[rgba(0,0,0,0.5)] px-2.5 py-1',
        'media-high-contrast:bg-media-background media-high-contrast:outline media-high-contrast:outline-current',
        'forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:outline forced-colors:outline-[CanvasText]',
        'transition-[opacity,transform] duration-media-base ease-out data-starting-style:opacity-0 data-ending-style:opacity-0',
        'motion-safe:data-starting-style:transform-[scale(0.95)] motion-safe:data-ending-style:transform-[scale(0.95)]',
        'motion-reduce:transition-none',
        'group/volume-status col-start-2 row-start-1 mt-3.5 h-7 w-[min(70%,11rem)] self-start overflow-hidden',
        'rounded-media-pill! bg-[rgba(255,255,255,0.2)]! p-0! text-white',
        'media-high-contrast:bg-black! media-high-contrast:outline media-high-contrast:outline-white',
        'forced-colors:bg-[Canvas]! forced-colors:text-[CanvasText] forced-colors:forced-color-adjust-none'
      )}
    >
      <VolumeIndicatorPrimitive.Fill
        className={cn(
          'flex size-full items-center rtl:flex-row-reverse gap-2 rounded-[inherit] px-1.5 py-0 bg-left bg-no-repeat bg-[linear-gradient(white,white)]',
          'bg-size-[var(--media-volume-fill,0%)_100%] transition-[background-size] duration-media-base ease-linear motion-reduce:transition-none',
          'forced-colors:bg-[linear-gradient(CanvasText,CanvasText)]'
        )}
      >
        <VolumeHighIconPrimitive
          className={cn(
            'hidden size-4.5 shrink-0 opacity-50 mix-blend-difference media-high-contrast:opacity-100',
            'forced-colors:rounded-media-pill forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:opacity-100 forced-colors:mix-blend-normal',
            'group-data-[level=high]/volume-status:block'
          )}
        />
        <VolumeLowIconPrimitive
          className={cn(
            'hidden size-4.5 shrink-0 opacity-50 mix-blend-difference media-high-contrast:opacity-100',
            'forced-colors:rounded-media-pill forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:opacity-100 forced-colors:mix-blend-normal',
            'group-data-[level=low]/volume-status:block'
          )}
        />
        <VolumeOffIconPrimitive
          className={cn(
            'hidden size-4.5 shrink-0 opacity-50 mix-blend-difference media-high-contrast:opacity-100',
            'forced-colors:rounded-media-pill forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:opacity-100 forced-colors:mix-blend-normal',
            'group-data-[level=off]/volume-status:block'
          )}
        />
        <VolumeIndicatorPrimitive.Value className={'hidden'} />
      </VolumeIndicatorPrimitive.Fill>
    </VolumeIndicatorPrimitive.Root>
  );
}
