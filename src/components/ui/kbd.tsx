import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const kbdVariants = cva(
  "grid select-none place-items-center whitespace-nowrap font-mono text-[0.75rem]/[1.1] font-semibold",
  {
    variants: {
      variant: {
        default: "bg-gray-200/70 dark:bg-gray-700/70 border border-gray-300/30 dark:border-gray-600/30 shadow-sm text-gray-700 dark:text-gray-300",
        outline: "border",
      },
      size: {
        default: "size-5 rounded",
        sm: "size-4 rounded-sm",
        lg: "size-6 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Kbd({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"kbd"> & VariantProps<typeof kbdVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "kbd"

  return <Comp className={cn(kbdVariants({ variant, size, className }))} {...props} />
}

export { Kbd, kbdVariants }
