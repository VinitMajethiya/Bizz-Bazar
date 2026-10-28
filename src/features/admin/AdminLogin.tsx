import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Logo } from '@/components/Logo';
import { signInAdmin } from '../../lib/api/auth';

interface LocationState {
  error?: string;
}

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const stateError = (location.state as LocationState)?.error;
  const [error, setError] = useState<string | null>(stateError || null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signInAdmin(email.trim(), password);

      if (!result.isAdmin) {
        setError(result.error || 'Wrong email or password');
        setLoading(false);
        return;
      }

      // Success: navigate to returnTo or /admin
      const returnTo = searchParams.get('returnTo');
      navigate(returnTo ? decodeURIComponent(returnTo) : '/admin', { replace: true });
    } catch {
      setError('Wrong email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-5 py-12">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin Sign In | By Raya.co</title>
      </Helmet>

      <div className="w-full max-w-sm space-y-6 bg-surface border border-line p-8 rounded-none">
        <div className="text-center space-y-2">
          <Logo linkTo="/" />
          <h1 className="text-base font-normal text-ink pt-2">Owner Sign In</h1>
          <p className="text-xs text-muted font-light">Enter your credentials to access the admin portal</p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded-none leading-relaxed"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-normal text-ink mb-1">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@byraya.co"
              className="w-full px-3 py-2 bg-bg border border-line rounded-none text-xs text-ink focus:outline-none focus:border-ink font-light"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-normal text-ink mb-1">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-line rounded-none text-xs text-ink focus:outline-none focus:border-ink font-light"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[42px] bg-ink text-bg text-xs font-normal rounded-ui hover:bg-accent transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-[11px] text-center text-muted font-light">
          Only authorized admin profiles have access.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
