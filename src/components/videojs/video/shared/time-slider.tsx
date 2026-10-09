import { Slider as SliderPrimitive } from '@videojs/react';
import { TimeSlider as TimeSliderPrimitive } from '@videojs/react';

import { cn } from '@/lib/utils';

export function TimeSlider({ audio = false, renderThumbnail }: ThumbnailSlot & { audio?: boolean } = {}) {
  return (
    <div className={'w-full'}>
      <TimeSliderPrimitive.Root
        className={cn(
          'group/slider relative flex h-5 min-w-12 flex-1 cursor-pointer items-center',
          'data-disabled:cursor-not-allowed data-disabled:opacity-40 forced-colors:data-disabled:text-[GrayText] forced-colors:data-disabled:opacity-100'
        )}
        thumbAlignment="edge"
      >
        <TimeSliderPrimitive.Chapters
          className={'relative flex size-full items-center'}
          renderChapter={(props) => (
            <div
              className={cn(
                'absolute inset-0 flex items-center clip-media-chapter-x',
                '[--media-chapter-inset-start:0.5] [--media-chapter-inset-end:0.5]',
                'first-of-type:[--media-chapter-inset-start:0] last-of-type:[--media-chapter-inset-end:0]'
              )}
              {...props}
            >
              <TimeSliderPrimitive.Track
                className={cn(
                  'absolute inset-x-0 isolate h-1 rounded-media-pill forced-colors:h-1.5',
                  'before:absolute before:inset-y-0 before:rounded-media-pill before:bg-current before:opacity-20 before:clip-media-chapter-track-x',
                  'media-high-contrast:before:opacity-50! forced-colors:before:bg-[Canvas] forced-colors:before:opacity-100! forced-colors:before:forced-color-adjust-none',
                  'forced-colors:before:border forced-colors:before:border-solid forced-colors:before:border-[CanvasText]',
                  audio && 'before:opacity-10! forced-colors:before:opacity-100!'
                )}
              >
                <TimeSliderPrimitive.Buffer
                  className={cn(
                    'absolute inset-y-0 rounded-media-pill bg-current opacity-30 clip-media-x-[--media-slider-buffer]',
                    'forced-colors:opacity-100! forced-colors:forced-color-adjust-none',
                    'forced-colors:bg-[repeating-linear-gradient(135deg,CanvasText_0px,CanvasText_1px,Canvas_1px,Canvas_3px)]',
                    audio && 'opacity-10! forced-colors:opacity-100!'
                  )}
                />
                <TimeSliderPrimitive.Fill
                  className={cn(
                    'absolute inset-y-0 rounded-media-pill bg-media-primary clip-media-x-[--media-slider-fill] forced-colors:forced-color-adjust-none',
                    'group-data-dragging/slider:clip-media-x-[--media-slider-pointer]',
                    'forced-colors:bg-[Canvas] forced-colors:bg-[linear-gradient(Highlight,Highlight)]'
                  )}
                />
              </TimeSliderPrimitive.Track>
            </div>
          )}
        ></TimeSliderPrimitive.Chapters>
        <TimeSliderPrimitive.Thumb
          className={cn(
            'absolute left-[var(--media-slider-fill,0%)] size-3 transform-[translateX(-50%)] rounded-media-pill bg-current',
            'group-data-dragging/slider:left-(--media-slider-pointer)',
            'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
            'forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none',
            'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]'
          )}
        />

        <TimeSliderPrimitive.Preview
          className={cn(
            'pointer-events-none bottom-full grid max-w-39 origin-bottom justify-items-center gap-1',
            'opacity-0 blur-media-hidden-popup transform-[scale(var(--media-hidden-popup-scale))] transition-media-popup motion-reduce:transition-none group-data-disabled/slider:hidden',
            'group-data-pointing/slider:opacity-100 group-data-pointing/slider:filter-none group-data-pointing/slider:transform-none',
            'group-data-dragging/slider:opacity-100 group-data-dragging/slider:filter-none group-data-dragging/slider:transform-none',
            'group-has-focus-visible/slider:opacity-100 group-has-focus-visible/slider:filter-none group-has-focus-visible/slider:transform-none'
          )}
        >
          <SliderPrimitive.Thumbnail.Root
            className={'block max-w-39 overflow-hidden rounded-md bg-[rgba(0,0,0,0.5)] shadow-lg'}
          >
            <SliderPrimitive.Thumbnail.Image render={renderThumbnail} className={'block'} />
          </SliderPrimitive.Thumbnail.Root>
          <div
            className={cn(
              'flex w-full min-w-0 justify-center px-2',
              audio &&
                'w-auto! rounded-md bg-media-popover px-1.5! py-0.5 text-media-popover-foreground surface-media media-high-contrast:outline forced-colors:outline'
            )}
          >
            <div className={'flex max-w-full min-w-0 items-center gap-2'}>
              <TimeSliderPrimitive.Value className={'shrink-0 tabular-nums'} type="pointer" />
              <TimeSliderPrimitive.ChapterTitle className={'min-w-0 truncate opacity-70 empty:hidden'} />
            </div>
          </div>
        </TimeSliderPrimitive.Preview>
      </TimeSliderPrimitive.Root>
    </div>
  );
}

export interface ThumbnailSlot {
  /** Draws the storyboard frame in the slider preview in place of the one the skin renders. */
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps['render'];
}
