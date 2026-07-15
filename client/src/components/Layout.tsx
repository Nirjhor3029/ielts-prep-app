import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  active?: 'home' | 'modules' | 'progress' | 'profile';
  className?: string;
}

export default function Layout({ children, active = 'home', className = '' }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-background text-on-surface dark:text-on-surface transition-colors">
      <Sidebar active={active} />
      <main className={`md:ml-64 ${className}`}>
        {children}
      </main>
      <BottomNav active={active} />
    </div>
  );
}
