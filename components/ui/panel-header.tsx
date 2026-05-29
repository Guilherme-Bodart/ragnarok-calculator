import type { ReactNode } from "react";

type PanelHeaderProps = {
  icon?: ReactNode;
  meta?: ReactNode;
  title: ReactNode;
};

export function PanelHeader({ icon, meta, title }: PanelHeaderProps) {
  return (
    <div className="guild-panel-header">
      <span>
        {icon}
        {title}
      </span>
      {meta ? <small>{meta}</small> : null}
    </div>
  );
}
