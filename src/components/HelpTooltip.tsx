import { HelpCircle } from "lucide-react";
import { Tooltip } from "antd";
import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  ariaLabel: string;
};

export function HelpTooltip({ title, ariaLabel }: Props) {
  return (
    <Tooltip title={title}>
      <button
        type="button"
        aria-label={ariaLabel}
        className="text-slate-400 hover:text-slate-700 transition-colors"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    </Tooltip>
  );
}
