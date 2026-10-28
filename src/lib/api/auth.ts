import { supabase, isSupabaseConfigured } from '../supabase';

export interface AdminAuthResult {
  isAdmin: boolean;
  userId: string | null;
  error?: string;
}

export async function signInAdmin(email: string, password: string): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured) {
    // Development fallback when credentials are not configured
    if (email === 'admin@byraya.co' && password === 'admin123') {
      return { isAdmin: true, userId: 'dev-admin-id' };
    }
    return { isAdmin: false, userId: null, error: 'Wrong email or password' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { isAdmin: false, userId: null, error: 'Wrong email or password' };
  }

  // Check profiles.role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    // Non-admin account: immediately sign out
    await supabase.auth.signOut();
    return {
      isAdmin: false,
      userId: data.user.id,
      error: "This account doesn’t have admin access.",
    };
  }

  return { isAdmin: true, userId: data.user.id };
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

export async function checkCurrentAdmin(): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: string | null;
}> {
  if (!isSupabaseConfigured) {
    // In dev mode without Supabase, check if a session was mocked in memory
    return { isAuthenticated: true, isAdmin: true, userId: 'dev-admin' };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return { isAuthenticated: false, isAdmin: false, userId: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  return {
    isAuthenticated: true,
    isAdmin,
    userId: session.user.id,
  };
}
