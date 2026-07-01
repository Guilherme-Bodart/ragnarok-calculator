"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";
import { PanelHeader } from "./panel-header";
import { ScrollArea } from "./scroll-area";

type ModalSize = "sm" | "md" | "lg" | "xl";

type ModalProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  icon?: ReactNode;
  meta?: ReactNode;
  title: ReactNode;
  size?: ModalSize;
  onClose: () => void;
};

const sizeClasses: Record<ModalSize, string> = {
  sm: "w-full max-w-md",
  md: "w-[90vw] max-w-2xl",
  lg: "w-[95vw] max-w-5xl",
  xl: "w-[98vw] max-w-7xl",
};

export function Modal({
  ariaLabel,
  children,
  className,
  closeLabel = "Fechar",
  icon,
  meta,
  title,
  size = "md",
  onClose,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="ui-modal-backdrop" role="presentation">
      <section
        aria-modal="true"
        className={cn("ui-modal", sizeClasses[size], className)}
        role="dialog"
        aria-label={ariaLabel}
      >
        <PanelHeader icon={icon} title={title} meta={meta} />
        <IconButton
          className="ui-modal-close"
          label={closeLabel}
          type="button"
          onClick={onClose}
        >
          <X size={17} />
        </IconButton>
        <ScrollArea className="ui-modal-body">{children}</ScrollArea>
      </section>
    </div>,
    document.body
  );
}
