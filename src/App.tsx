import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Card } from "antd";
import PlopCommands from "@/components/PlopCommands";
import { HelpTooltip } from "@/components/HelpTooltip";
/* PLOP_INJECT_IMPORT */

/**
 * App router shell. Generated pages register their route + nav link here
 * automatically via the Page / Feature generators (PLOP_INJECT_* markers).
 * DO NOT remove the PLOP_INJECT_* comment markers — plop relies on them.
 */
function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome to your app.</p>
          </div>
          <HelpTooltip
            ariaLabel="What does npm run plop do?"
            title={
              <div className="max-w-xs">
                <p className="font-bold mb-1">npm run plop</p>
                <p>
                  Runs the Plop scaffolder. Pick a generator (Resource, Form, Table, Page,
                  Feature, or Auth) and it stamps out the boilerplate files for you — schema,
                  service, hooks, components, and page shell — so you fill in logic instead of
                  writing structure from scratch.
                </p>
              </div>
            }
          />
        </div>

        <Card className="mb-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Pages</h2>
          <p className="text-sm text-slate-500 mb-4">Scaffolded pages register their link here.</p>
          <nav className="flex flex-wrap items-center gap-4">
            {/* PLOP_INJECT_LINK */}
          </nav>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900 mb-1">Get started</h2>
          <p className="text-sm text-slate-500 mb-4">
            Run{" "}
            <code className="font-mono text-xs bg-slate-100 border border-slate-200 rounded-sm px-1.5 py-0.5">
              npm run plop
            </code>{" "}
            and pick a generator to scaffold the boilerplate.
          </p>
          <PlopCommands />
        </Card>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* PLOP_INJECT_ROUTE */}
      </Routes>
    </BrowserRouter>
  );
}
