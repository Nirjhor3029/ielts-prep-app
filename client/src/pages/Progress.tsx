import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attemptsAPI } from '../lib/api';
import Layout from '../components/Layout';

export default function Progress() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptsAPI.getStats()
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout active="progress">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const hasData = stats?.summary?.totalAttempts > 0;

  const avgScore = stats?.summary?.averageScore
    ? (stats.summary.averageScore).toFixed(1)
    : '0.0';

  if (!hasData) {
    return (
      <Layout active="progress">
        <div className="min-h-screen pb-24 md:pb-8">
          <header className="bg-background fixed md:static top-0 w-full z-50 h-16 flex items-center justify-between px-container-padding">
            <h1 className="font-headline-md text-headline-md font-bold tracking-tight">IELTS Prep</h1>
          </header>

          <main className="pt-20 md:pt-6 px-container-padding max-w-[768px] mx-auto flex flex-col items-center justify-center text-center gap-lg">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px' }}>bar_chart</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">No Progress Yet</h2>
              <p className="font-body-md text-on-surface-variant">Complete a practice or test to start tracking your progress here.</p>
            </div>
            <Link
              to="/modules"
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              Start Learning
            </Link>

            <Link
              to="/mistakes"
              className="w-full mt-lg bg-secondary-container rounded-xl p-lg shadow-[0_8px_20px_0px_rgba(0,0,0,0.08)] flex items-center justify-between text-left active:scale-[0.98] transition-transform block"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/40 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-on-secondary-container">auto_stories</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-on-secondary-container text-body-lg">Mistake Notebook</h3>
                  <p className="font-body-md text-on-secondary-container/80">Review your tricky items</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-secondary-container">arrow_forward</span>
            </Link>
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout active="progress">
      <div className="min-h-screen pb-24 md:pb-8">
        <header className="bg-background fixed md:static top-0 w-full z-50 h-16 flex items-center justify-between px-container-padding">
          <h1 className="font-headline-md text-headline-md font-bold tracking-tight">IELTS Prep</h1>
        </header>

        <main className="pt-20 md:pt-6 px-container-padding max-w-[768px] mx-auto space-y-xl">
          <section>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-xs">Your Progress</h2>
            <p className="font-body-md text-on-surface-variant">
              {stats?.recentAttempts?.length > 0
                ? `Steady improvement over the last ${stats.recentAttempts.length} tests.`
                : 'Complete some tests to see your progress here.'}
            </p>
          </section>

          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
            <div className="flex justify-between items-end mb-lg">
              <div>
                <span className="font-label-md text-on-surface-variant block mb-1">Average Score</span>
                <span className="font-display text-display text-primary">{avgScore}</span>
              </div>
              <div className="text-right">
                <span className="font-label-md text-primary bg-primary-fixed/30 px-2 py-1 rounded-full">
                  {stats?.summary?.totalAttempts || 0} tests taken
                </span>
              </div>
            </div>

            {stats?.recentAttempts?.length > 0 && (
              <div className="h-32 w-full mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#00685f" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#00685f" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line stroke="#e1e3e4" strokeDasharray="4" strokeWidth="1" x1="0" x2="400" y1="20" y2="20" />
                  <line stroke="#e1e3e4" strokeDasharray="4" strokeWidth="1" x1="0" x2="400" y1="50" y2="50" />
                  <line stroke="#e1e3e4" strokeDasharray="4" strokeWidth="1" x1="0" x2="400" y1="80" y2="80" />
                  {stats.recentAttempts.length > 1 && (
                    <>
                      <path
                        d={`M0,${100 - (stats.recentAttempts[0]?.score / stats.recentAttempts[0]?.totalQuestions || 0.5) * 80} ${stats.recentAttempts.map((a: any, i: number) => `L${(i / (stats.recentAttempts.length - 1)) * 400},${100 - (a.score / a.totalQuestions) * 80}`).join(' ')} V100 H0 Z`}
                        fill="url(#chartGradient)"
                      />
                      <path
                        className="chart-path"
                        d={`M0,${100 - (stats.recentAttempts[0]?.score / stats.recentAttempts[0]?.totalQuestions || 0.5) * 80} ${stats.recentAttempts.map((a: any, i: number) => `L${(i / (stats.recentAttempts.length - 1)) * 400},${100 - (a.score / a.totalQuestions) * 80}`).join(' ')}`}
                        fill="none"
                        stroke="#00685f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                    </>
                  )}
                  {stats.recentAttempts.map((a: any, i: number) => (
                    <circle
                      key={i}
                      cx={stats.recentAttempts.length === 1 ? 200 : (i / (stats.recentAttempts.length - 1)) * 400}
                      cy={100 - (a.score / a.totalQuestions) * 80}
                      fill="#00685f"
                      r={i === stats.recentAttempts.length - 1 ? 6 : 4}
                      className={i === stats.recentAttempts.length - 1 ? 'animate-pulse' : ''}
                    />
                  ))}
                </svg>
              </div>
            )}
          </div>

          <Link
            to="/mistakes"
            className="w-full bg-secondary-container rounded-xl p-lg shadow-[0_8px_20px_0px_rgba(0,0,0,0.08)] flex items-center justify-between text-left active:scale-[0.98] transition-transform block"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/40 p-3 rounded-lg">
                <span className="material-symbols-outlined text-on-secondary-container">auto_stories</span>
              </div>
              <div>
                <h3 className="font-headline-md text-on-secondary-container text-body-lg">Mistake Notebook</h3>
                <p className="font-body-md text-on-secondary-container/80">Review your tricky items</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-secondary-container">arrow_forward</span>
          </Link>

          {stats?.recentAttempts?.length > 0 && (
            <section className="space-y-md">
              <div className="flex justify-between items-center px-xs">
                <h3 className="font-headline-md text-body-lg text-on-surface">Recent Attempts</h3>
              </div>
              <div className="space-y-sm">
                {stats.recentAttempts.map((attempt: any) => (
                  <div key={attempt._id} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-fixed/20 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-primary">
                          {attempt.mode === 'test' ? 'assignment' : 'edit_note'}
                        </span>
                      </div>
                      <div>
                        <span className="font-label-md text-on-surface block">
                          {(attempt.chapterId as any)?.title || 'Chapter'}
                        </span>
                        <span className="font-caption text-on-surface-variant">
                          {attempt.mode === 'test' ? 'Test' : 'Practice'} • {new Date(attempt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-headline-md text-primary">
                        {attempt.score}<span className="text-on-surface-variant text-label-md">/{attempt.totalQuestions}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="pb-12">
            <h3 className="font-headline-md text-body-lg text-on-surface mb-md">Quick Insights</h3>
            <div className="grid grid-cols-2 gap-md">
              <div className="bg-surface-container-low p-md rounded-xl">
                <span className="material-symbols-outlined text-primary mb-2">timer</span>
                <span className="block font-label-md text-on-surface">{stats?.summary?.totalAttempts || 0} Tests</span>
                <span className="block font-caption text-on-surface-variant">Total Taken</span>
              </div>
              <div className="bg-surface-container-low p-md rounded-xl">
                <span className="material-symbols-outlined text-primary mb-2">trending_up</span>
                <span className="block font-label-md text-on-surface">{stats?.topChapter?.title || 'N/A'}</span>
                <span className="block font-caption text-on-surface-variant">Top Performer</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
