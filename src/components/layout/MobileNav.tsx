"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { iconProps } from "@/components/ui/icon";

/** Menu button + slide-in drawer holding the sidebar, for screens below lg. */
export function MobileNav({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  // Close when a link is followed or the backdrop (the dialog element itself) is clicked.
  function onClick(e: MouseEvent<HTMLDialogElement>) {
    const target = e.target as HTMLElement;
    if (target === e.currentTarget || target.closest("a")) close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Open menu"
        className="flex size-10 items-center justify-center rounded-control text-text-secondary outline-none hover:bg-neutral-bg focus-visible:shadow-focus lg:hidden"
      >
        <Menu {...iconProps} />
      </button>
      <dialog
        ref={dialogRef}
        onClick={onClick}
        aria-label="Menu"
        className="m-0 h-full max-h-none w-66 max-w-none bg-transparent p-0 backdrop:bg-brand-900/50"
      >
        <div className="relative h-full">
          {children}
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute top-4 right-3 flex size-8 items-center justify-center rounded-control text-sidebar-text outline-none hover:text-text-inverse focus-visible:shadow-focus"
          >
            <X size={18} strokeWidth={1.6} aria-hidden />
          </button>
        </div>
      </dialog>
    </>
  );
}
