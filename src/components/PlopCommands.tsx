import { useState } from "react";
import { Check, Copy } from "lucide-react";

type PlopCommand = {
  cmd: string;
  desc: string;
  run: string;
};

const COMMANDS: PlopCommand[] = [
  {
    cmd: "Resource",
    desc: "Zod schema + wretch service + TanStack Query hooks",
    run: 'npx plop Resource "<Name>"',
  },
  { cmd: "Form", desc: "React Hook Form + Zod form component", run: 'npx plop Form "<Name>"' },
  { cmd: "Table", desc: "Plain HTML table — simple display", run: 'npx plop Table "<Name>"' },
  {
    cmd: "DataTable",
    desc: "TanStack Table — sort, filter, paginate",
    run: 'npx plop DataTable "<Name>"',
  },
  { cmd: "Page", desc: "Thin React page shell", run: 'npx plop Page "<Name>"' },
  {
    cmd: "Feature",
    desc: "All of the Above, one-shot",
    run: 'npx plop Feature "<Name>"',
  },
  { cmd: "Auth", desc: "Amplify Cognito auth scaffold", run: "npx plop Auth" },
];

export default function PlopCommands() {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(cmd: string, run: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(run);
      setCopied(cmd);
      setTimeout(() => setCopied((current) => (current === cmd ? null : current)), 1500);
    } catch {
      // Clipboard API unavailable (insecure context) — leave state untouched.
    }
  }

  return (
    <div className="rounded-sm border border-slate-200">
      {COMMANDS.map(({ cmd, desc, run }) => (
        <div
          key={cmd}
          className="group flex items-center gap-4 border-t border-slate-200 px-4 py-3 first:border-t-0 first:rounded-t-xl last:rounded-b-xl transition-colors hover:bg-slate-50"
        >
          <code className="shrink-0 font-mono text-xs font-medium text-emerald-700 bg-emerald-100 rounded px-2 py-1 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            {cmd}
          </code>
          <span className="flex-1 text-sm text-slate-700">{desc}</span>
          <div className="relative shrink-0">
            <span
              role="status"
              aria-hidden={copied !== cmd}
              className={`pointer-events-none absolute bottom-full right-0 mb-2 rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg transition-opacity ${
                copied === cmd ? "opacity-100" : "opacity-0"
              }`}
            >
              Copied!
            </span>
            <button
              type="button"
              onClick={() => handleCopy(cmd, run)}
              aria-label={copied === cmd ? `Copied ${run}` : `Copy "${run}"`}
              className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:cursor-pointer hover:bg-slate-100 hover:text-slate-700 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 group-hover:opacity-100"
            >
              {copied === cmd ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
