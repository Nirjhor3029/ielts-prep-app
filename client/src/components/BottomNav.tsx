import { Link } from 'react-router-dom';

interface BottomNavProps {
  active?: 'home' | 'modules' | 'progress' | 'profile';
}

export default function BottomNav({ active = 'home' }: BottomNavProps) {
  const items = [
    { key: 'home' as const, icon: 'home', label: 'Home', to: '/' },
    { key: 'modules' as const, icon: 'menu_book', label: 'Modules', to: '/modules' },
    { key: 'progress' as const, icon: 'leaderboard', label: 'Progress', to: '/progress' },
    { key: 'profile' as const, icon: 'person', label: 'Profile', to: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] h-20 flex justify-around items-center px-4 bg-surface-container-lowest z-50 rounded-t-xl shadow-[0_-4px_12px_0px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            to={item.to}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all active:scale-90 duration-200 ${
              isActive
                ? 'bg-primary-container text-on-primary-container rounded-full'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-label-md text-label-md">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
