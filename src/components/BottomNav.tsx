import { NavLink } from 'react-router-dom';
import { Flame, Trophy, MapPin, Heart, User } from 'lucide-react';
import { useApp } from '../store/AppContext';

const NAV = [
  { to: '/app/discover', icon: Flame, label: 'Discover' },
  { to: '/app/competition', icon: Trophy, label: 'Partners' },
  { to: '/app/gyms', icon: MapPin, label: 'Gyms' },
  { to: '/app/matches', icon: Heart, label: 'Matches' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { state } = useApp();
  const matchCount = state.matches.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800 flex justify-around items-center h-16 max-w-md mx-auto">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 relative ${
              isActive ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'
            } transition-colors`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {label === 'Matches' && matchCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                    {matchCount > 99 ? '99+' : matchCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
