import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError('Invalid email or password.');
    else navigate('/admin', { replace: true });
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <div className="font-serif text-3xl tracking-[0.18em]">TWELVE</div>
        <div className="text-[10px] tracking-[0.5em] text-smoke mt-1">ADMIN PANEL</div>
      </div>
      <form onSubmit={login} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-ink/20 bg-white/60 px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-ink/20 bg-white/60 px-4 py-3 text-sm outline-none focus:border-ink"
        />
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-ink text-ivory text-sm tracking-[0.25em] py-3.5 disabled:opacity-50"
        >
          {busy ? 'SIGNING IN…' : 'SIGN IN'}
        </button>
      </form>
      <p className="text-center text-xs text-smoke mt-6">
        <Link to="/" className="underline underline-offset-4">Back to store</Link>
      </p>
    </div>
  );
}
