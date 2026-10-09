import { Menu as MenuPrimitive } from '@videojs/react';
import { CheckIcon as CheckIconPrimitive } from '@videojs/react/icons/compat';

import { cn } from '@/lib/utils';

export function RadioItem({ children, ...props }: MenuPrimitive.RadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      className={cn(
        'group/menu-radio flex cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-1.5',
        'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current',
        'data-highlighted:bg-(--media-button-highlight) media-high-contrast:data-highlighted:highlight-media forced-colors:data-highlighted:highlight-media'
      )}
      {...props}
    >
      {children}
      <MenuPrimitive.ItemIndicator
        forceMount
        className={'ms-auto -me-1 shrink-0 opacity-0 group-aria-checked/menu-radio:opacity-100'}
      >
        <CheckIconPrimitive className={'size-4.5 shrink-0 opacity-70'} />
      </MenuPrimitive.ItemIndicator>
    </MenuPrimitive.RadioItem>
  );
}
