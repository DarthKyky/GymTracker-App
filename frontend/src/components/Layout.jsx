import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Dumbbell, ClipboardList, TrendingUp, LogOut } from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/history', label: 'History', icon: ClipboardList },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-carbon-950">
      {/* Sidebar */}
      <aside className="w-60 bg-carbon-900 border-r border-carbon-700 flex flex-col fixed inset-y-0 left-0 z-20">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-carbon-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-volt-400 rounded flex items-center justify-center">
              <Dumbbell size={14} className="text-carbon-950" />
            </div>
            <span className="font-display text-2xl text-volt-400 tracking-widest">GYMTRACK</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {nav.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-volt-400/10 text-volt-400 border border-volt-400/20'
                    : 'text-steel-400 hover:bg-carbon-700 hover:text-slate-200'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-carbon-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-volt-400/20 border border-volt-400/30 flex items-center justify-center">
              <span className="text-volt-400 text-xs font-semibold uppercase">
                {user?.username?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.username}</p>
              <p className="text-xs text-steel-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-steel-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all duration-200"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
