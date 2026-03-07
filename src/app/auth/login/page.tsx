'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    console.log('API Check:', {
      url: rawUrl.slice(0, 15) + '...',
      urlLength: rawUrl.length,
      keySuffix: '...' + rawKey.slice(-3),
      keyLength: rawKey.length,
      hasTrailingSlash: rawUrl.endsWith('/'),
      hasLeadingSpace: rawKey.startsWith(' ') || rawUrl.startsWith(' ')
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setIsLoading(true);

    try {
      let client = supabase;
      if (debugMode && manualUrl && manualKey) {
        const { createBrowserClient } = await import('@supabase/ssr');
        client = createBrowserClient(manualUrl, manualKey);
      }
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login Detail Error:', error);
        throw error;
      }

      toast.success('Successfully logged in!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);

    try {
      let client = supabase;
      if (debugMode && manualUrl && manualKey) {
        const { createBrowserClient } = await import('@supabase/ssr');
        client = createBrowserClient(manualUrl, manualKey);
      }
      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          }
        },
      });

      if (error) {
        console.error('Signup Detail Error:', error);
        throw error;
      }

      toast.success('Check your email to confirm your account!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      let client = supabase;
      if (debugMode && manualUrl && manualKey) {
        const { createBrowserClient } = await import('@supabase/ssr');
        client = createBrowserClient(manualUrl, manualKey);
      }
      
      // Simple head request to a common table
      const { error } = await client.from('habits').select('id', { count: 'exact', head: true });
      
      if (error) {
        console.error('Test Connection Error:', error);
        toast.error(`Connection Failed: ${error.message}`);
      } else {
        toast.success('Connection Successful! Supabase is reachable.');
      }
    } catch (err: any) {
      console.error('Test Connection Exception:', err);
      toast.error(`Test Exception: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {isSignUp ? 'Join Life Tracker today' : 'Sign in to your Life Tracker account'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={isSignUp ? handleSignUp : handleLogin}>
          <div className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-950 border-zinc-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Sign up' : 'Sign in')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'No account? Create one'}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest mx-auto block"
          >
            {debugMode ? 'Hide Debug' : 'Connection Debug'}
          </button>
          
          {debugMode && (
            <div className="mt-4 space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <p className="text-[10px] text-blue-400 font-mono">Manual Connection Override</p>
              <Input 
                className="text-xs font-mono h-8 bg-black border-zinc-800" 
                placeholder="Supabase URL" 
                value={manualUrl}
                onChange={e => setManualUrl(e.target.value)}
              />
              <Input 
                className="text-xs font-mono h-8 bg-black border-zinc-800" 
                placeholder="Anon/Publishable Key" 
                value={manualKey}
                onChange={e => setManualKey(e.target.value)}
              />
              <p className="text-[9px] text-zinc-600 leading-tight">
                Enter your keys manually above to bypass environment variables. 
                If sign-in works after entering keys here, the issue is with your Vercel Environment Variables.
              </p>
              <Button 
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isLoading}
                className="w-full text-xs h-8 border-blue-900/50 text-blue-400 hover:bg-blue-900/20"
              >
                {isLoading ? 'Testing...' : 'Test Connection (Table)'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
