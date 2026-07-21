import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { INTERACTION } from "@/lib/design/tokens"
import { cn } from "@/lib/utils"

/**
 * INTERACTION レシピに対応する Tailwind クラス（値は tokens と一致させる）。
 * JIT が検出できるよう完全な静的文字列にする。
 * - press.scale = 0.97
 * - radius.button = 12
 * - transition.css.pressMs = 100
 * - transition.css.ease = cubic-bezier(0.22, 1, 0.36, 1)
 * - hover.y = -2 / hover.shadow.hover
 */
const RECIPE_CLASSES = [
  "rounded-[12px]",
  "duration-100",
  "ease-[cubic-bezier(0.22,1,0.36,1)]",
  "active:scale-[0.97]",
  "hover:-translate-y-[2px]",
  "hover:shadow-[0_12px_32px_rgba(0,0,0,0.42)]",
  "motion-reduce:active:scale-100",
  "motion-reduce:hover:translate-y-0",
  "motion-reduce:hover:shadow-none",
].join(" ")

const buttonVariants = cva(
  // Apple Design + INTERACTION レシピ
  [
    "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none",
    "transition-[transform,background-color,box-shadow,color,border-color,filter]",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    RECIPE_CLASSES,
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline hover:translate-y-0 hover:shadow-none active:scale-100",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[12px] px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[12px] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[12px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[12px]",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  style,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      style={{
        // tokens 直参照（角丸・duration・easing のランタイム正本）
        borderRadius: INTERACTION.radius.button,
        transitionDuration: `${INTERACTION.transition.css.pressMs}ms`,
        transitionTimingFunction: INTERACTION.transition.css.ease,
        ...style,
      }}
      {...props}
    />
  )
}

export { Button, buttonVariants }
