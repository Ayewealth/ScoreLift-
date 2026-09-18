import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "cn"

function DropdownMenuRoot(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root {...props} />
}

function DropdownMenuTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-trigger"
      className={cn(
        "flex cursor-pointer items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#4a7c59] aria-expanded:opacity-80",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal {...props} />
}

function DropdownMenuPositioner({ className, ...props }: MenuPrimitive.Positioner.Props) {
  return (
    <MenuPrimitive.Positioner
      data-slot="dropdown-positioner"
      className={cn("z-50", className)}
      {...props}
    />
  )
}

function DropdownMenuPopup({ className, ...props }: MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Popup
      data-slot="dropdown-popup"
      className={cn(
        "min-w-44 origin-[--anchor-point] rounded-xl border border-[#e8e6dd] bg-white p-1.5 shadow-lg focus:outline-none",
        "data-[side=none]:animate-in data-[side=none]:fade-in-0 data-[side=none]:zoom-in-95",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-[#2d3a2a] outline-none transition-colors hover:bg-[#eaf0e8] focus-visible:bg-[#eaf0e8] data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dropdown-separator"
      className={cn("mx-2 my-1 h-px bg-[#e8e6dd]", className)}
      {...props}
    />
  )
}

export {
  DropdownMenuRoot as DropdownMenu,
  DropdownMenuTrigger as DropdownMenuTrigger,
  DropdownMenuPortal as DropdownMenuPortal,
  DropdownMenuPositioner as DropdownMenuPositioner,
  DropdownMenuPopup as DropdownMenuPopup,
  DropdownMenuItem as DropdownMenuItem,
  DropdownMenuSeparator as DropdownMenuSeparator,
}