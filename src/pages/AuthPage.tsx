import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { MOCK_USERS, DEMO_USER } from '../data/mockData';

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
    // Demo: log in as the demo account
    dispatch({ type: 'LOGIN', user: DEMO_USER });
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

        {/* Demo access */}
        <div className="pt-2 border-t border-zinc-800 space-y-3">
          <p className="text-xs text-zinc-500 text-center">or</p>
          <button
            onClick={() => { dispatch({ type: 'LOGIN', user: DEMO_USER }); navigate('/app/discover'); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 transition-colors text-left"
          >
            <img
              src={DEMO_USER.photos[0]}
              alt={DEMO_USER.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">Try the demo</p>
              <p className="text-zinc-400 text-xs">{DEMO_USER.homeGym?.name} · no account needed</p>
            </div>
            <ArrowRight size={16} className="text-orange-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
