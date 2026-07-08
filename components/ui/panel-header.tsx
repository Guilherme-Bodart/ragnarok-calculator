import type { ReactNode } from "react";

type PanelHeaderProps = {
  icon?: ReactNode;
  meta?: ReactNode;
  title: ReactNode;
};

export function PanelHeader({ icon, meta, title }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 mb-4 backdrop-blur-md bg-[#061122]/40 border-b border-white/10 rounded-t-2xl shadow-sm">
      <span className="flex items-center gap-2 text-[15px] font-bold text-slate-100 uppercase tracking-widest">
        <span className="text-sky-400">{icon}</span>
        {title}
      </span>
      {meta ? <small className="text-xs font-semibold text-slate-400">{meta}</small> : null}
    </div>
  );
}
