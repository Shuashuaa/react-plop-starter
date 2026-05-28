import { useState } from 'react';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiResult {
  status: number;
  statusText: string;
  data: unknown;
  duration: number;
  ok: boolean;
}

const METHOD_STYLES: Record<Method, { active: string; badge: string }> = {
  GET:    { active: 'bg-blue-600 text-white',   badge: 'bg-blue-100 text-blue-700' },
  POST:   { active: 'bg-green-600 text-white',  badge: 'bg-green-100 text-green-700' },
  PATCH:  { active: 'bg-yellow-500 text-white', badge: 'bg-yellow-100 text-yellow-700' },
  DELETE: { active: 'bg-red-600 text-white',    badge: 'bg-red-100 text-red-700' },
};

const METHODS: Method[] = ['GET', 'POST', 'PATCH', 'DELETE'];

function tryParseJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text || null; }
}

function statusColor(status: number) {
  if (status >= 200 && status < 300) return 'bg-green-100 text-green-700';
  if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-700';
  if (status >= 500) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
}

const QUICK_TESTS = [
  { label: 'List',   method: 'GET'    as Method, path: '/resource' },
  { label: 'Get',    method: 'GET'    as Method, path: '/resource/:id' },
  { label: 'Create', method: 'POST'   as Method, path: '/resource' },
  { label: 'Update', method: 'PATCH'  as Method, path: '/resource/:id' },
  { label: 'Delete', method: 'DELETE' as Method, path: '/resource/:id' },
  { label: 'Page 1', method: 'GET'    as Method, path: '/resource?cursor=' },
];

export const ApiTester = () => {
  const [baseUrl, setBaseUrl] = useState(
    import.meta.env.VITE_API_BASE_URL ?? 'https://jsonplaceholder.typicode.com'
  );
  const [path, setPath] = useState('/users');
  const [method, setMethod] = useState<Method>('GET');
  const [body, setBody] = useState('{\n  \n}');
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setResult(null);
    const start = performance.now();
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      };
      if ((method === 'POST' || method === 'PATCH') && body.trim()) {
        options.body = body;
      }
      const res = await fetch(`${baseUrl}${path}`, options);
      const text = await res.text();
      setResult({
        status: res.status,
        statusText: res.statusText,
        data: tryParseJson(text),
        duration: Math.round(performance.now() - start),
        ok: res.ok,
      });
    } catch (e) {
      setResult({
        status: 0,
        statusText: 'Network Error',
        data: { error: (e as Error).message },
        duration: Math.round(performance.now() - start),
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyQuickTest = (qt: (typeof QUICK_TESTS)[number]) => {
    setMethod(qt.method);
    setPath(qt.path);
    setResult(null);
  };

  return (
    <div className="space-y-4">
      {/* Base URL */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-sm text-gray-700">API Tester</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Set <code className="bg-gray-100 px-1 rounded">VITE_API_BASE_URL</code> in{' '}
            <code className="bg-gray-100 px-1 rounded">.env</code> to prefill the base URL.
          </p>
        </div>
        <div className="p-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Base URL</label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="https://your-api.com"
          />
        </div>
      </div>

      {/* Quick test shortcuts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick CRUD Tests</h3>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {QUICK_TESTS.map((qt) => (
            <button
              key={qt.label}
              onClick={() => applyQuickTest(qt)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${METHOD_STYLES[qt.method].badge}`}>
                {qt.method}
              </span>
              <span className="font-mono text-gray-600">{qt.path}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Request builder */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Request</h3>
        </div>
        <div className="p-4 space-y-3">
          {/* Method + Path + Send */}
          <div className="flex gap-2">
            <div className="flex rounded-md border border-gray-200 overflow-hidden shrink-0">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-2.5 py-1.5 text-xs font-bold border-r border-gray-200 last:border-r-0 transition-colors ${
                    method === m ? METHOD_STYLES[m].active : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="/users or /users/123"
            />
            <button
              onClick={send}
              disabled={loading}
              className="px-4 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors shrink-0"
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>

          {/* Body editor for POST / PATCH */}
          {(method === 'POST' || method === 'PATCH') && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Body (JSON)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                spellCheck={false}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
                placeholder='{ "name": "Jane Doe" }'
              />
            </div>
          )}
        </div>
      </div>

      {/* Response */}
      {result && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusColor(result.status)}`}>
              {result.status || 'ERR'} {result.statusText}
            </span>
            <span className="text-xs text-gray-400">{result.duration} ms</span>
            {result.ok ? (
              <span className="text-xs text-green-600 font-medium ml-auto">✓ Success</span>
            ) : (
              <span className="text-xs text-red-500 font-medium ml-auto">✗ Failed</span>
            )}
          </div>
          <pre className="p-4 text-xs font-mono overflow-auto max-h-96 text-gray-800 bg-gray-50 leading-relaxed">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
