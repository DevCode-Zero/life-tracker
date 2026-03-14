import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Life <span className="text-blue-500">Tracker</span>
          </h1>
          <p className="text-xl text-gray-400">
            Build the life you want, one habit at a time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          {session ? (
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors w-full sm:w-auto"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              href="/auth/login" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors w-full sm:w-auto"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
