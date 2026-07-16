import { Link } from 'react-router-dom';
import { useThemeStore } from '../stores/themeStore';

interface SidebarProps {
  active?: 'home' | 'modules' | 'progress' | 'profile';
}

export default function Sidebar({ active = 'home' }: SidebarProps) {
  const { mode, toggle } = useThemeStore();
  const items = [
    { key: 'home' as const, icon: 'home', label: 'Home', to: '/' },
    { key: 'modules' as const, icon: 'menu_book', label: 'Modules', to: '/modules' },
    { key: 'progress' as const, icon: 'leaderboard', label: 'Progress', to: '/progress' },
    { key: 'profile' as const, icon: 'person', label: 'Profile', to: '/profile' },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-surface-container-lowest dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline-variant z-50 transition-colors">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-xl">school</span>
        </div>
        <span className="font-headline-md text-headline-md text-on-surface font-semibold">IELTS Prep</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-body-md text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2 space-y-1">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[22px]">{mode === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          <span className="font-body-md text-body-md">{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="px-6 py-5 border-t border-outline-variant">
        <p className="font-caption text-caption text-on-surface-variant">IELTS Prep App v1.0</p>
      </div>
    </aside>
  );
}
