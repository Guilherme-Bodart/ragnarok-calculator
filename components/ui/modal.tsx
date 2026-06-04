import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";
import { PanelHeader } from "./panel-header";
import { ScrollArea } from "./scroll-area";

type ModalProps = {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  closeLabel: string;
  icon?: ReactNode;
  meta?: ReactNode;
  title: ReactNode;
  onClose: () => void;
};

export function Modal({
  ariaLabel,
  children,
  className,
  closeLabel,
  icon,
  meta,
  title,
  onClose,
}: ModalProps) {
  return (
    <div className="ui-modal-backdrop" role="presentation">
      <section
        aria-modal="true"
        className={cn("ui-modal", className)}
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
    </div>
  );
}
