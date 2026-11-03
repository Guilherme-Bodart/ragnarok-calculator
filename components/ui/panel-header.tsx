import type { ReactNode } from "react";

type PanelHeaderProps = {
  icon?: ReactNode;
  meta?: ReactNode;
  title: ReactNode;
};

export function PanelHeader({ icon, meta, title }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-sky-500/15 w-full">
      <span className="flex items-center gap-2 text-xs font-black text-sky-100 uppercase tracking-widest">
        {icon ? (
          <span className="text-sky-400 flex items-center shrink-0">{icon}</span>
        ) : null}
        <span>{title}</span>
      </span>
      {meta ? (
        <small className="text-xs font-semibold text-slate-400 shrink-0">
          {meta}
        </small>
      ) : null}
    </div>
  );
}
