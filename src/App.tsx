import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import PlopCommands from "@/components/PlopCommands";
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
          <div className="group relative">
            <button
              type="button"
              aria-label="What does npm run plop do?"
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <div
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full z-40 mt-2 w-72 rounded-sm border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <p className="font-semibold text-slate-900 mb-1">npm run plop</p>
              <p className="text-slate-500">
                Runs the Plop scaffolder. Pick a generator (Resource, Form, Table, Page, Feature, or Auth) and it stamps out the boilerplate files for you — schema, service, hooks, components, and page shell — so you fill in logic instead of writing structure from scratch.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Get started</h2>
          <p className="text-sm text-slate-500 mb-5">
            Run{" "}
            <code className="font-mono text-xs bg-slate-100 border border-slate-200 rounded-sm px-2 py-1.5">
              npm run plop
            </code>{" "}
            and pick a generator to scaffold the boilerplate.
          </p>

          <PlopCommands />
        </div>
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
