import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="relative flex flex-col h-full max-w-md mx-auto bg-zinc-950">
      {/* Scrollable content area above fixed nav */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
