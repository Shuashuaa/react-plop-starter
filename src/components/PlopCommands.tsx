import { useState } from "react";
import { App, Button, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
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
  { cmd: "Table", desc: "AntD Table — simple display", run: 'npx plop Table "<Name>"' },
  {
    cmd: "DataTable",
    desc: "AntD Table — sort, filter, paginate",
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
  const { message } = App.useApp();
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(cmd: string, run: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(run);
      setCopied(cmd);
      message.success("Copied!");
      setTimeout(() => setCopied((current) => (current === cmd ? null : current)), 1500);
    } catch {
      // Clipboard API unavailable (insecure context) — leave state untouched.
    }
  }

  const columns: ColumnsType<PlopCommand> = [
    {
      title: "Command",
      dataIndex: "cmd",
      key: "cmd",
      render: (cmd: string) => (
        <Tag color="blue" className="font-semibold">
          {cmd}
        </Tag>
      ),
    },
    { title: "Description", dataIndex: "desc", key: "desc" },
    {
      title: "",
      key: "copy",
      align: "right",
      width: 56,
      render: (_, record) => (
        <Tooltip title={copied === record.cmd ? "Copied!" : "Copy"}>
          <Button
            type="text"
            size="small"
            aria-label={`Copy "${record.run}"`}
            icon={
              copied === record.cmd ? (
                <Check className="w-4 h-4 text-slate-900" />
              ) : (
                <Copy className="w-4 h-4" />
              )
            }
            onClick={() => handleCopy(record.cmd, record.run)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table<PlopCommand>
      rowKey="cmd"
      columns={columns}
      dataSource={COMMANDS}
      pagination={false}
      size="middle"
    />
  );
}
