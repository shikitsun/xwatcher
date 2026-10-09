import { Time, Controls, Tooltip, BufferingIndicator } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { AirPlayButton } from './airplay-button';
import { CaptionsToggle } from './captions-button';
import { LiveButton } from './live-button';
import { PlayButton } from './play-button';
import { TimeSlider } from './time-slider';
import { type ThumbnailSlot } from './time-slider';
import { VolumePopover } from './volume-popover';

export function ControlsRow({
  audio = false,
  live = false,
  menu,
  rate,
  seekBackward,
  seekForward,
}: ControlsSlots & { audio?: boolean; live?: boolean; menu?: ReactNode } = {}) {
  return (
    <Controls.Group className={'flex items-center rtl:flex-row-reverse justify-between gap-2'}>
      <Controls.Group className={cn('flex items-center rtl:flex-row-reverse gap-1', 'min-w-0')}>
        <PlayButton />
        {seekBackward}
        {seekForward}
        {live && <LiveButton />}
        {audio ? rate : <VolumePopover />}
        {!live && (
          <Time.Group className={'flex shrink-0 items-center rtl:flex-row-reverse gap-1 px-1.5 tabular-nums'}>
            <Time.Value
              className={cn(
                'cursor-pointer rounded-sm media-xs:hidden outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-media-ring',
                'data-disabled:cursor-not-allowed data-disabled:opacity-40 forced-colors:data-disabled:text-[GrayText] forced-colors:data-disabled:opacity-100'
              )}
              type="current"
              toggle
            />
            <Time.Value className={'hidden media-xs:inline data-unavailable:opacity-50'} type="current" />
            <Time.Separator className={'hidden opacity-70 media-xs:inline data-unavailable:opacity-50'} />
            <Time.Value className={'hidden opacity-70 media-xs:inline data-unavailable:opacity-50'} type="duration" />
          </Time.Group>
        )}
      </Controls.Group>

      <Controls.Group className={'flex items-center rtl:flex-row-reverse gap-1'}>
        {(!live || audio) && <CaptionsToggle />}
        {menu ?? (audio && <VolumePopover />)}
        {audio && <AirPlayButton />}
      </Controls.Group>
    </Controls.Group>
  );
}

export interface ControlsSlots extends ThumbnailSlot {
  /** The playback-rate control, supplied by the on-demand audio preset. */
  rate?: ReactNode;
  /** The skip-back control, supplied by the presets that have a timeline. */
  seekBackward?: ReactNode;
  /** The skip-forward control, supplied by the presets that have a timeline. */
  seekForward?: ReactNode;
}

export function ControlsContent({
  audio = false,
  center = false,
  live = false,
  menu,
  rate,
  renderThumbnail,
  seekBackward,
  seekForward,
  top,
}: ControlsSlots & { audio?: boolean; center?: boolean; live?: boolean; menu?: ReactNode; top?: ReactNode } = {}) {
  return (
    <BufferingIndicator className={'group/buffering contents'}>
      {!audio && (
        <Controls.Backdrop
          className={
            'pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_top,rgba(0,0,0,0.7),rgba(0,0,0,0.2),rgba(0,0,0,0.5))] group-not-data-visible/buffering:not-data-visible:hidden forced-colors:bg-none'
          }
        />
      )}
      <Controls.Content
        className={cn('group/controls pointer-events-none absolute inset-0 z-30', audio && 'relative! inset-auto!')}
      >
        <Tooltip.Provider>
          {top && (
            <Controls.Group
              className={cn(
                'group-not-data-visible/controls:pointer-events-none pointer-events-auto absolute end-3 top-2.5 media-max-2xl:end-2 media-max-2xl:top-2 flex items-center gap-1',
                'media-high-contrast:rounded-lg media-high-contrast:bg-media-background forced-colors:rounded-lg forced-colors:bg-[Canvas]',
                'forced-colors:inset-x-0 forced-colors:top-0 forced-colors:justify-end forced-colors:rounded-none! forced-colors:px-3 forced-colors:py-2.5',
                'media-max-2xl:forced-colors:px-2 media-max-2xl:forced-colors:py-2 media-max-2xl:forced-colors:top-0 media-max-2xl:forced-colors:end-0',
                'forced-colors:end-0',
                'transition-[opacity,transform] duration-media-instant ease-out group-not-data-visible/controls:duration-media-base group-not-data-visible/controls:opacity-0 motion-reduce:transition-none',
                'motion-safe:group-not-data-visible/controls:transform-[translateY(var(--media-spacing))]'
              )}
            >
              {top}
            </Controls.Group>
          )}
          {center && (
            <Controls.Group
              className={cn(
                'group-not-data-visible/controls:pointer-events-none pointer-events-auto absolute left-1/2 top-1/2 hidden transform-[translate(-50%,-50%)] items-center rtl:flex-row-reverse gap-3 media-360:flex group-data-visible/buffering:hidden!',
                'media-high-contrast:rounded-lg media-high-contrast:bg-media-background forced-colors:bg-transparent!',
                'transition-[opacity,transform] duration-media-instant ease-out group-not-data-visible/controls:duration-media-base group-not-data-visible/controls:opacity-0 motion-reduce:transition-none',
                'motion-safe:group-not-data-visible/controls:transform-[translate(-50%,-50%)_scale(0.9)]'
              )}
            >
              {seekBackward}
              <PlayButton
                className={cn(
                  'bg-[rgba(0,0,0,0.4)]! media-high-contrast:bg-media-background! forced-colors:bg-[ButtonFace]!',
                  'hover:bg-[rgba(0,0,0,0.85)]! focus-visible:bg-[rgba(0,0,0,0.85)]! aria-expanded:bg-[rgba(0,0,0,0.85)]!',
                  'media-high-contrast:hover:bg-media-foreground! media-high-contrast:focus-visible:bg-media-foreground! media-high-contrast:aria-expanded:bg-media-foreground!',
                  'forced-colors:hover:bg-[Highlight]! forced-colors:focus-visible:bg-[Highlight]! forced-colors:aria-expanded:bg-[Highlight]!',
                  'size-14.5!'
                )}
                iconClassName={'size-7!'}
                tooltip={false}
              />
              {seekForward}
            </Controls.Group>
          )}
          <div
            className={cn(
              'group-not-data-visible/controls:pointer-events-none pointer-events-auto absolute inset-x-2 bottom-2 flex flex-col gap-0',
              'media-high-contrast:rounded-lg media-high-contrast:bg-media-background forced-colors:rounded-lg forced-colors:bg-[Canvas]',
              'transition-[opacity,transform] duration-media-instant ease-out group-not-data-visible/controls:duration-media-base group-not-data-visible/controls:opacity-0 motion-reduce:transition-none',
              'motion-safe:group-not-data-visible/controls:transform-[translateY(var(--media-spacing))]',
              audio && 'static! px-2.5 py-2',
              !audio &&
                'forced-colors:inset-x-0 forced-colors:bottom-0 forced-colors:rounded-none! forced-colors:px-2 forced-colors:py-2'
            )}
          >
            {!live && <TimeSlider audio={audio} renderThumbnail={renderThumbnail} />}
            <ControlsRow
              audio={audio}
              live={live}
              menu={menu}
              rate={rate}
              seekBackward={center ? undefined : seekBackward}
              seekForward={center ? undefined : seekForward}
            />
          </div>
        </Tooltip.Provider>
      </Controls.Content>
    </BufferingIndicator>
  );
}
