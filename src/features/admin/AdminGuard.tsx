import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { checkCurrentAdmin, signOutAdmin } from '../../lib/api/auth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AdminGuardProps {
  children?: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized' | 'forbidden'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      try {
        const { isAuthenticated, isAdmin } = await checkCurrentAdmin();
        if (!isMounted) return;

        if (!isAuthenticated) {
          setStatus('unauthorized');
        } else if (!isAdmin) {
          await signOutAdmin();
          setErrorMessage("This account doesn’t have admin access.");
          setStatus('forbidden');
        } else {
          setStatus('authorized');
        }
      } catch {
        if (isMounted) {
          setStatus('unauthorized');
        }
      }
    }

    verifyAuth();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_OUT' || !session) {
          const returnTo = encodeURIComponent(location.pathname + location.search);
          navigate(`/admin/login?returnTo=${returnTo}`, { replace: true });
        }
      });

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [location.pathname, location.search, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-ink">
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="w-6 h-6 border-2 border-line border-t-ink rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted font-light">Verifying access...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?returnTo=${returnTo}`} replace />;
  }

  if (status === 'forbidden') {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ error: errorMessage || "This account doesn’t have admin access." }}
      />
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {children ? children : <Outlet />}
    </>
  );
};

export default AdminGuard;
