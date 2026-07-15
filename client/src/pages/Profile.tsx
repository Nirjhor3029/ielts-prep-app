import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Layout from '../components/Layout';

export default function Profile() {
  const { user, logout } = useAuthStore();

  return (
    <Layout active="profile">
      <div className="min-h-screen pb-24 md:pb-8">
        <header className="bg-background fixed md:static top-0 w-full z-50 h-16 flex items-center justify-between px-container-padding">
          <h1 className="font-headline-md text-headline-md font-bold">Profile</h1>
        </header>

        <main className="pt-20 md:pt-6 px-container-padding max-w-[768px] mx-auto space-y-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '40px' }}>person</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">{user?.name}</h2>
              <p className="font-body-md text-on-surface-variant">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-md">
            <div className="bg-surface-container-low rounded-xl p-md text-center">
              <span className="font-headline-md text-headline-md text-primary block">{user?.totalCorrect || 0}</span>
              <span className="font-caption text-caption text-on-surface-variant">Correct</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-md text-center">
              <span className="font-headline-md text-headline-md text-primary block">{user?.totalAttempts || 0}</span>
              <span className="font-caption text-caption text-on-surface-variant">Attempts</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-md text-center">
              <span className="font-headline-md text-headline-md text-secondary block">{user?.streak || 0}</span>
              <span className="font-caption text-caption text-on-surface-variant">Streak</span>
            </div>
          </div>

          <div className="space-y-sm">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="w-full bg-surface-container-lowest rounded-xl p-md flex items-center gap-4 shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                <span className="font-label-md text-label-md text-on-surface flex-1">Admin Panel</span>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </Link>
            )}

            <Link
              to="/progress"
              className="w-full bg-surface-container-lowest rounded-xl p-md flex items-center gap-4 shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-primary">leaderboard</span>
              <span className="font-label-md text-label-md text-on-surface flex-1">View Progress</span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </Link>

            <button
              onClick={logout}
              className="w-full bg-surface-container-lowest rounded-xl p-md flex items-center gap-4 shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] hover:bg-error-container transition-colors"
            >
              <span className="material-symbols-outlined text-error">logout</span>
              <span className="font-label-md text-label-md text-error flex-1 text-left">Sign Out</span>
            </button>
          </div>
        </main>
      </div>
    </Layout>
  );
}
