import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // In Phase 0, placeholder sign-in navigates to /admin
    setTimeout(() => {
      setLoading(false);
      navigate('/admin');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-5 py-12">
      <div className="w-full max-w-sm space-y-8 bg-surface border border-line p-8 rounded-ui">
        <div className="text-center space-y-2">
          <Logo linkTo="/" />
          <h1 className="text-lg font-normal text-ink pt-2">Owner Sign In</h1>
          <p className="text-xs text-muted">Manage your store, orders, and catalogue</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-danger text-danger text-xs rounded-ui">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-medium text-ink mb-1">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@byraya.co"
              className="w-full px-3 py-2 bg-bg border border-line rounded-ui text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-medium text-ink mb-1">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-line rounded-ui text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[40px] bg-ink text-bg text-xs uppercase tracking-wider font-medium rounded-ui hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-[11px] text-center text-muted">
          Only authorized admin profiles have access.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
