import { ErrorDialog as ErrorDialogPrimitive } from '@videojs/react';

import { cn } from '@/lib/utils';

import { Button } from './button';

export function ErrorDialog() {
  return (
    <ErrorDialogPrimitive.Root>
      <ErrorDialogPrimitive.Backdrop className={'absolute inset-0 z-40 bg-[rgba(0,0,0,0.75)] not-data-open:hidden'} />
      <ErrorDialogPrimitive.Popup
        className={cn(
          'absolute left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-80 max-h-[calc(100%-2rem)] transform-[translate(-50%,-50%)] gap-3 overflow-auto rounded-lg bg-media-popover p-5 text-media-popover-foreground not-data-open:hidden',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-media-ring',
          'media-high-contrast:border media-high-contrast:border-solid media-high-contrast:border-current forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]'
        )}
      >
        <ErrorDialogPrimitive.Title className={'text-lg font-bold'} />
        <ErrorDialogPrimitive.Description className={'text-[calc(var(--media-spacing)*3.5)]'} />
        <ErrorDialogPrimitive.Close
          render={<Button />}
          className={'h-8 w-auto justify-self-end border! border-solid border-current px-3'}
        />
      </ErrorDialogPrimitive.Popup>
    </ErrorDialogPrimitive.Root>
  );
}
