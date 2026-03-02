import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { MOCK_USERS } from '../data/mockData';
import { GYMS } from '../data/mockData';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useApp();
  const navigate = useNavigate();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Demo: log in as first mock user for simplicity
    dispatch({ type: 'LOGIN', user: MOCK_USERS[0] });
    navigate('/app/discover');
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    // Create a bare-bones profile and proceed to onboarding
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      user: {
        id: `user-${Date.now()}`,
        name,
        age: 25,
        gender: 'male',
        interestedIn: ['female'],
        bio: '',
        photos: [],
        homeGym: null,
        franTime: null,
        backSquat1RM: null,
        deadlift1RM: null,
        crossfitRanking: null,
        favoriteMovement: 'Snatch',
        leastFavoriteMovement: 'Burpee',
        lookingFor: 'both',
        division: 'rx',
      },
    });
    navigate('/onboarding');
  }

  // Quick demo login shortcuts
  function demoLogin(userId: string) {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      dispatch({ type: 'LOGIN', user });
      navigate('/app/discover');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-zinc-950">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
          <Dumbbell size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          RX Match
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Find your CrossFit match — romantic or competitive
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm card p-6 space-y-5">
        {/* Tabs */}
        <div className="flex bg-zinc-800 rounded-xl p-1">
          {(['login', 'signup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
                tab === t
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="label">Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  className="input-field pl-9"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                className="input-field pl-9"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                className="input-field pl-9"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            {tab === 'login' ? 'Log In' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo shortcuts */}
        <div className="pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-3 text-center">
            Quick demo — log in as:
          </p>
          <div className="flex flex-col gap-2">
            {MOCK_USERS.slice(0, 3).map((u) => (
              <button
                key={u.id}
                onClick={() => demoLogin(u.id)}
                className="flex items-center gap-3 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors text-left"
              >
                <img
                  src={u.photos[0]}
                  alt={u.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold">
                    {u.name}, {u.age}
                  </p>
                  <p className="text-zinc-500 text-xs truncate">
                    {u.homeGym?.name} · {u.division.toUpperCase()}
                  </p>
                </div>
                <ArrowRight size={14} className="text-zinc-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
