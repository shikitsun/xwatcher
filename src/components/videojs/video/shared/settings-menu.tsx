import { audioText, captionsText, qualityText, settingsText, speedText } from '@videojs/core/i18n/text/menu';
import { Text as TextPrimitive } from '@videojs/react';
import { Menu } from '@videojs/react';
import {
  ChevronIcon as ChevronIconPrimitive,
  SwitchesIcon as SwitchesIconPrimitive,
  SpeechIcon as SpeechIconPrimitive,
  SpeedIcon as SpeedIconPrimitive,
  CaptionsOffIcon as CaptionsOffIconPrimitive,
  GearIcon as GearIconPrimitive,
} from '@videojs/react/icons/compat';
import { AudioTrackRadioGroup } from '@videojs/react/ui/audio-track-radio-group';
import { CaptionsRadioGroup } from '@videojs/react/ui/captions-radio-group';
import { PlaybackRateRadioGroup } from '@videojs/react/ui/playback-rate-radio-group';
import { QualityRadioGroup } from '@videojs/react/ui/quality-radio-group';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { RadioItem } from './menu-item';
import { ButtonTooltip } from './tooltip';

function MenuChevron({ back = false }: { back?: boolean } = {}) {
  return (
    <ChevronIconPrimitive
      className={
        back
          ? 'size-4 shrink-0 transform-[rotate(180deg)] rtl:transform-none opacity-70'
          : 'size-4 shrink-0 opacity-70 rtl:transform-[scaleX(-1)]'
      }
    />
  );
}

function QualityMenu() {
  return (
    <Menu.Root>
      <QualityRadioGroup.Root>
        <Menu.Trigger
          className={cn(
            'flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-start',
            'data-[availability=unavailable]:hidden data-[availability=unsupported]:hidden focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current',
            'data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media'
          )}
        >
          <SwitchesIconPrimitive className={'size-4.5 shrink-0 opacity-70'} />
          <TextPrimitive token={qualityText.key}>{qualityText.text}</TextPrimitive>
          <span className={'ms-auto inline-flex min-w-0 items-center gap-1 ps-2 opacity-70'}>
            <QualityRadioGroup.Value className={'max-w-24 truncate'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content
          className={cn(
            'not-data-submenu:flex not-data-submenu:flex-col not-data-submenu:gap-0.5',
            'not-data-submenu:data-child-open:blur-media-hidden',
            'not-data-submenu:data-child-open:before:hidden',
            'data-submenu:media-transitioning:pointer-events-none data-submenu:media-transitioning:overflow-hidden',
            'data-submenu:media-transitioning:blur-media-hidden',
            'absolute max-h-full overflow-auto overscroll-none outline-hidden',
            '[clip-path:inset(0)] transition-[transform,filter,clip-path] duration-media-menu ease-out',
            'not-data-submenu:inset-x-1 not-data-submenu:top-1 not-data-submenu:max-h-[calc(100%-var(--media-spacing)*2)]',
            'not-data-submenu:data-child-open:transform-[translateX(-100%)]',
            'not-data-submenu:data-child-open:rtl:transform-[translateX(100%)]',
            'not-data-submenu:data-child-open:[clip-path:inset(0_0_0_100%)] not-data-submenu:data-child-open:rtl:[clip-path:inset(0_100%_0_0)]',
            'data-submenu:inset-x-0 data-submenu:top-0 data-submenu:z-10 data-submenu:p-1',
            'data-submenu:media-transitioning:transform-[translateX(100%)] data-submenu:media-transitioning:rtl:transform-[translateX(-100%)]',
            'data-submenu:media-transitioning:[clip-path:inset(0_100%_0_0)] data-submenu:media-transitioning:rtl:[clip-path:inset(0_0_0_100%)]'
          )}
        >
          <Menu.Item
            className={cn(
              'mb-0.5 flex w-full cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-1.5 text-start',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current',
              'data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media'
            )}
          >
            <MenuChevron back />
            <TextPrimitive token={qualityText.key}>{qualityText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'my-1 block border-b border-media-muted'} />
          <QualityRadioGroup.Options
            className={'flex flex-col gap-0.5'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>
                  <span>{item.label}</span>
                  {item.tier ? (
                    <sup className={'ps-0.5 pt-px text-media-sm font-semibold leading-none opacity-70'}>
                      {item.tier}
                    </sup>
                  ) : null}
                </span>
                {item.badge ? (
                  <span className={'rounded-sm bg-media-muted px-1.5 text-media-sm font-semibold'}>{item.badge}</span>
                ) : null}
              </RadioItem>
            )}
          ></QualityRadioGroup.Options>
        </Menu.Content>
      </QualityRadioGroup.Root>
    </Menu.Root>
  );
}

function AudioTrackMenu() {
  return (
    <Menu.Root>
      <AudioTrackRadioGroup.Root>
        <Menu.Trigger
          className={cn(
            'flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-start',
            'data-[availability=unavailable]:hidden data-[availability=unsupported]:hidden focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current',
            'data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media'
          )}
        >
          <SpeechIconPrimitive className={'size-4.5 shrink-0 opacity-70'} />
          <TextPrimitive token={audioText.key}>{audioText.text}</TextPrimitive>
          <span className={'ms-auto inline-flex min-w-0 items-center gap-1 ps-2 opacity-70'}>
            <AudioTrackRadioGroup.Value className={'max-w-24 truncate'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content
          className={cn(
            'not-data-submenu:flex not-data-submenu:flex-col not-data-submenu:gap-0.5',
            'not-data-submenu:data-child-open:blur-media-hidden',
            'not-data-submenu:data-child-open:before:hidden',
            'data-submenu:media-transitioning:pointer-events-none data-submenu:media-transitioning:overflow-hidden',
            'data-submenu:media-transitioning:blur-media-hidden',
            'absolute max-h-full overflow-auto overscroll-none outline-hidden',
            '[clip-path:inset(0)] transition-[transform,filter,clip-path] duration-media-menu ease-out',
            'not-data-submenu:inset-x-1 not-data-submenu:top-1 not-data-submenu:max-h-[calc(100%-var(--media-spacing)*2)]',
            'not-data-submenu:data-child-open:transform-[translateX(-100%)]',
            'not-data-submenu:data-child-open:rtl:transform-[translateX(100%)]',
            'not-data-submenu:data-child-open:[clip-path:inset(0_0_0_100%)] not-data-submenu:data-child-open:rtl:[clip-path:inset(0_100%_0_0)]',
            'data-submenu:inset-x-0 data-submenu:top-0 data-submenu:z-10 data-submenu:p-1',
            'data-submenu:media-transitioning:transform-[translateX(100%)] data-submenu:media-transitioning:rtl:transform-[translateX(-100%)]',
            'data-submenu:media-transitioning:[clip-path:inset(0_100%_0_0)] data-submenu:media-transitioning:rtl:[clip-path:inset(0_0_0_100%)]'
          )}
        >
          <Menu.Item
            className={cn(
              'mb-0.5 flex w-full cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-1.5 text-start',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current',
              'data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media'
            )}
          >
            <MenuChevron back />
            <TextPrimitive token={audioText.key}>{audioText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'my-1 block border-b border-media-muted'} />
          <AudioTrackRadioGroup.Options
            className={'flex flex-col gap-0.5'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          ></AudioTrackRadioGroup.Options>
        </Menu.Content>
      </AudioTrackRadioGroup.Root>
    </Menu.Root>
  );
}

function PlaybackRateMenu() {
  return (
    <Menu.Root>
      <PlaybackRateRadioGroup.Root>
        <Menu.Trigger
          className={cn(
            'flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-start',
            'data-[availability=unavailable]:hidden data-[availability=unsupported]:hidden focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current',
            'data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media'
          )}
        >
          <SpeedIconPrimitive className={'size-4.5 shrink-0 opacity-70'} />
          <TextPrimitive token={speedText.key}>{speedText.text}</TextPrimitive>
          <span className={'ms-auto inline-flex min-w-0 items-center gap-1 ps-2 opacity-70'}>
            <PlaybackRateRadioGroup.Value className={'max-w-24 truncate'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content
          className={cn(
            'not-data-submenu:flex not-data-submenu:flex-col not-data-submenu:gap-0.5',
            'not-data-submenu:data-child-open:blur-media-hidden',
            'not-data-submenu:data-child-open:before:hidden',
            'data-submenu:media-transitioning:pointer-events-none data-submenu:media-transitioning:overflow-hidden',
            'data-submenu:media-transitioning:blur-media-hidden',
            'absolute max-h-full overflow-auto overscroll-none outline-hidden',
            '[clip-path:inset(0)] transition-[transform,filter,clip-path] duration-media-menu ease-out',
            'not-data-submenu:inset-x-1 not-data-submenu:top-1 not-data-submenu:max-h-[calc(100%-var(--media-spacing)*2)]',
            'not-data-submenu:data-child-open:transform-[translateX(-100%)]',
            'not-data-submenu:data-child-open:rtl:transform-[translateX(100%)]',
            'not-data-submenu:data-child-open:[clip-path:inset(0_0_0_100%)] not-data-submenu:data-child-open:rtl:[clip-path:inset(0_100%_0_0)]',
            'data-submenu:inset-x-0 data-submenu:top-0 data-submenu:z-10 data-submenu:p-1',
            'data-submenu:media-transitioning:transform-[translateX(100%)] data-submenu:media-transitioning:rtl:transform-[translateX(-100%)]',
            'data-submenu:media-transitioning:[clip-path:inset(0_100%_0_0)] data-submenu:media-transitioning:rtl:[clip-path:inset(0_0_0_100%)]'
          )}
        >
          <Menu.Item
            className={cn(
              'mb-0.5 flex w-full cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-1.5 text-start',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current',
              'data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media'
            )}
          >
            <MenuChevron back />
            <TextPrimitive token={speedText.key}>{speedText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'my-1 block border-b border-media-muted'} />
          <PlaybackRateRadioGroup.Options
            className={'flex flex-col gap-0.5'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          ></PlaybackRateRadioGroup.Options>
        </Menu.Content>
      </PlaybackRateRadioGroup.Root>
    </Menu.Root>
  );
}

function CaptionsMenu() {
  return (
    <Menu.Root>
      <CaptionsRadioGroup.Root>
        <Menu.Trigger
          className={cn(
            'flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-start',
            'data-[availability=unavailable]:hidden data-[availability=unsupported]:hidden focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current',
            'data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media'
          )}
        >
          <CaptionsOffIconPrimitive className={'size-4.5 shrink-0 opacity-70'} />
          <TextPrimitive token={captionsText.key}>{captionsText.text}</TextPrimitive>
          <span className={'ms-auto inline-flex min-w-0 items-center gap-1 ps-2 opacity-70'}>
            <CaptionsRadioGroup.Value className={'max-w-24 truncate'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content
          className={cn(
            'not-data-submenu:flex not-data-submenu:flex-col not-data-submenu:gap-0.5',
            'not-data-submenu:data-child-open:blur-media-hidden',
            'not-data-submenu:data-child-open:before:hidden',
            'data-submenu:media-transitioning:pointer-events-none data-submenu:media-transitioning:overflow-hidden',
            'data-submenu:media-transitioning:blur-media-hidden',
            'absolute max-h-full overflow-auto overscroll-none outline-hidden',
            '[clip-path:inset(0)] transition-[transform,filter,clip-path] duration-media-menu ease-out',
            'not-data-submenu:inset-x-1 not-data-submenu:top-1 not-data-submenu:max-h-[calc(100%-var(--media-spacing)*2)]',
            'not-data-submenu:data-child-open:transform-[translateX(-100%)]',
            'not-data-submenu:data-child-open:rtl:transform-[translateX(100%)]',
            'not-data-submenu:data-child-open:[clip-path:inset(0_0_0_100%)] not-data-submenu:data-child-open:rtl:[clip-path:inset(0_100%_0_0)]',
            'data-submenu:inset-x-0 data-submenu:top-0 data-submenu:z-10 data-submenu:p-1',
            'data-submenu:media-transitioning:transform-[translateX(100%)] data-submenu:media-transitioning:rtl:transform-[translateX(-100%)]',
            'data-submenu:media-transitioning:[clip-path:inset(0_100%_0_0)] data-submenu:media-transitioning:rtl:[clip-path:inset(0_0_0_100%)]'
          )}
        >
          <Menu.Item
            className={cn(
              'mb-0.5 flex w-full cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-1.5 text-start',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current',
              'data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media'
            )}
          >
            <MenuChevron back />
            <TextPrimitive token={captionsText.key}>{captionsText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'my-1 block border-b border-media-muted'} />
          <CaptionsRadioGroup.Options
            className={'flex flex-col gap-0.5'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          ></CaptionsRadioGroup.Options>
        </Menu.Content>
      </CaptionsRadioGroup.Root>
    </Menu.Root>
  );
}

export function SettingsMenu() {
  return (
    <Menu.Root side="top" align="center">
      <ButtonTooltip label={<TextPrimitive token={settingsText.key}>{settingsText.text}</TextPrimitive>}>
        <Menu.Trigger render={<Button />} className={'group/settings'}>
          <GearIconPrimitive
            className={cn(
              'col-start-1 row-start-1 size-4.5',
              'transition-[transform] duration-media-base ease-in-out motion-reduce:transition-none motion-safe:group-aria-expanded/settings:transform-[rotate(90deg)]'
            )}
          />
          <TextPrimitive className={'sr-only'} token={settingsText.key}>
            {settingsText.text}
          </TextPrimitive>
        </Menu.Trigger>
      </ButtonTooltip>
      <Menu.Popup
        keepMounted
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
          'z-20 m-0 min-w-44 max-w-(--media-menu-available-width) overflow-hidden! rounded-lg border-0 bg-media-popover p-1 text-media-popover-foreground',
          'surface-media [--media-popup-side-offset:var(--media-popover-side-offset)] [--media-popover-side-offset:calc(var(--media-spacing)*6)]',
          'max-h-[min(var(--media-menu-available-height,--spacing(56)),--spacing(56))] overscroll-none',
          'h-(--media-menu-height) w-(--media-menu-width)',
          'transition-media-popup media-transitioning:transition-media-popup',
          'media-high-contrast:outline forced-colors:outline',
          'transition-media-menu-resize'
        )}
      >
        <Menu.Content
          className={cn(
            'not-data-submenu:flex not-data-submenu:flex-col not-data-submenu:gap-0.5',
            'not-data-submenu:data-child-open:blur-media-hidden',
            'not-data-submenu:data-child-open:before:hidden',
            'data-submenu:media-transitioning:pointer-events-none data-submenu:media-transitioning:overflow-hidden',
            'data-submenu:media-transitioning:blur-media-hidden',
            'absolute max-h-full overflow-auto overscroll-none outline-hidden',
            '[clip-path:inset(0)] transition-[transform,filter,clip-path] duration-media-menu ease-out',
            'not-data-submenu:inset-x-1 not-data-submenu:top-1 not-data-submenu:max-h-[calc(100%-var(--media-spacing)*2)]',
            'not-data-submenu:data-child-open:transform-[translateX(-100%)]',
            'not-data-submenu:data-child-open:rtl:transform-[translateX(100%)]',
            'not-data-submenu:data-child-open:[clip-path:inset(0_0_0_100%)] not-data-submenu:data-child-open:rtl:[clip-path:inset(0_100%_0_0)]',
            'data-submenu:inset-x-0 data-submenu:top-0 data-submenu:z-10 data-submenu:p-1',
            'data-submenu:media-transitioning:transform-[translateX(100%)] data-submenu:media-transitioning:rtl:transform-[translateX(-100%)]',
            'data-submenu:media-transitioning:[clip-path:inset(0_100%_0_0)] data-submenu:media-transitioning:rtl:[clip-path:inset(0_0_0_100%)]'
          )}
        >
          <QualityMenu />
          <AudioTrackMenu />
          <PlaybackRateMenu />
          <CaptionsMenu />
        </Menu.Content>
      </Menu.Popup>
    </Menu.Root>
  );
}
