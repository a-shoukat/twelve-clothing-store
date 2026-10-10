import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

/** Renders children only when an admin session exists; otherwise redirects to login. */
export default function AdminRoute({ children }) {
  const [state, setState] = useState('checking'); // checking | authed | guest

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? 'authed' : 'guest');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState(session ? 'authed' : 'guest');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state === 'checking') {
    return <div className="p-10 text-center text-smoke">Checking session…</div>;
  }
  if (state === 'guest') return <Navigate to="/admin/login" replace />;
  return children;
}
