import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

/*
  Boomerang Button — hierarchies, sizes and states mirror the Figma
  "Buttons" component set (Primary / Secondary / Tertiary / Link / Destructive;
  sizes sm/md/lg/xl; default/hover/focus/disabled/loading).
*/
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-semibold transition-all outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-xs ring-inset hover:bg-primary-hover disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none',
        secondary:
          'border border-border-strong bg-secondary text-secondary-foreground shadow-xs hover:bg-muted disabled:border-border disabled:bg-background disabled:text-gray-400 disabled:shadow-none',
        tertiary:
          'text-muted-foreground hover:bg-muted hover:text-secondary-foreground disabled:text-gray-400 disabled:hover:bg-transparent',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive-hover disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none',
        link: 'text-link underline-offset-4 hover:underline disabled:text-gray-400 disabled:no-underline',
        'link-gray':
          'text-muted-foreground underline-offset-4 hover:text-secondary-foreground hover:underline disabled:text-gray-400 disabled:no-underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-3.5 text-sm',
        lg: 'h-11 px-4 text-md',
        xl: 'h-12 px-[18px] text-md',
      },
      iconOnly: {
        true: 'gap-0 p-0',
      },
    },
    compoundVariants: [
      { iconOnly: true, size: 'sm', class: 'size-9 px-0' },
      { iconOnly: true, size: 'md', class: 'size-10 px-0' },
      { iconOnly: true, size: 'lg', class: 'size-11 px-0' },
      { iconOnly: true, size: 'xl', class: 'size-12 px-0' },
      { variant: 'link', size: ['sm', 'md', 'lg', 'xl'], class: 'h-auto p-0 shadow-none' },
      {
        variant: 'link-gray',
        size: ['sm', 'md', 'lg', 'xl'],
        class: 'h-auto p-0 shadow-none',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

function Button({
  className,
  variant = 'primary',
  size = 'md',
  iconOnly,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, iconOnly, className }))}
      {...props}
    >
      {loading && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
