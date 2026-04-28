import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/services/api';
import { ApiTester } from '@/components/ApiTester';

const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

const PostsSchema = z.array(PostSchema);

type Post = z.infer<typeof PostSchema>;

type View = 'demo' | 'tester';

function Demo() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['posts-demo'],
    queryFn: () =>
      api.url('/posts').query({ _limit: 5 }).get().json((d) => PostsSchema.parse(d)),
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-sm text-gray-700">
          Demo — Posts (JSONPlaceholder)
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Replace this with your generated components after running{' '}
          <code className="bg-gray-100 px-1 rounded">npm run plop</code>.
        </p>
      </div>

      {isLoading && (
        <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
      )}
      {error && (
        <div className="p-6 text-center text-sm text-red-600">
          Error: {(error as Error).message}
        </div>
      )}

      <ul className="divide-y divide-gray-100">
        {posts?.map((post) => (
          <li key={post.id} className="px-4 py-3">
            <p className="font-medium text-sm text-gray-800">{post.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>('demo');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">code-generator</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Run{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">npm run plop</code>{' '}
              to scaffold a resource, table, or form.
            </p>
          </div>

          {/* Nav toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            {(['demo', 'tester'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  view === v
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {v === 'tester' ? 'API Tester' : 'Demo'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {view === 'demo' ? <Demo /> : <ApiTester />}
      </div>
    </div>
  );
}

export default App;
