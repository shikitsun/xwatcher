import { Poster as PosterPrimitive } from '@videojs/react';
import { BufferingIndicator as BufferingIndicatorPrimitive } from '@videojs/react';
import { SpinnerIcon as SpinnerIconPrimitive } from '@videojs/react/icons/compat';

export function Poster({ renderImage }: { renderImage?: PosterPrimitive.ImageProps['render'] } = {}) {
  return (
    <PosterPrimitive.Root className={'absolute inset-0 size-full not-data-visible:hidden'}>
      <PosterPrimitive.Image render={renderImage} className={'size-full object-media'} />
    </PosterPrimitive.Root>
  );
}

export function BufferingIndicator() {
  return (
    <BufferingIndicatorPrimitive
      className={
        'pointer-events-none absolute inset-0 z-20 grid place-items-center not-data-visible:hidden not-data-visible:[--media-spinner-animation:none]'
      }
    >
      <SpinnerIconPrimitive className={'size-7'} />
    </BufferingIndicatorPrimitive>
  );
}
