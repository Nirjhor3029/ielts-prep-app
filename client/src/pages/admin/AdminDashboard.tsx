import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chaptersAPI, adminAPI, analyticsAPI } from '../../lib/api';
import Layout from '../../components/Layout';

type Tab = 'chapters' | 'analytics';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('chapters');
  const [chapters, setChapters] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      chaptersAPI.list().then((d) => setChapters(d.chapters)),
      analyticsAPI.dashboard().then((d) => setAnalytics(d)).catch(() => setAnalytics(null)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleTogglePublish = async (id: string) => {
    try {
      const data = await adminAPI.togglePublish(id);
      setChapters(chapters.map((ch) =>
        ch._id === id ? { ...ch, isPublished: data.chapter.isPublished } : ch
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    try {
      await adminAPI.deleteChapter(id);
      setChapters(chapters.filter((ch) => ch._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen pb-24 md:pb-8">
        <header className="bg-background fixed md:static top-0 w-full z-50 h-16 flex items-center justify-between px-container-padding">
          <div className="flex items-center gap-4">
            <Link to="/profile" className="active:scale-95 transition-transform text-on-surface-variant hover:opacity-80 md:hidden">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="font-headline-md text-headline-md font-bold">Admin Panel</h1>
          </div>
          <Link
            to="/admin/chapters/new"
            className="bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md text-label-md font-bold active:scale-95 transition-transform"
          >
            + New Chapter
          </Link>
        </header>

        <main className="pt-20 md:pt-6 px-container-padding max-w-[768px] mx-auto space-y-xl">
          <div className="flex gap-2 p-1 bg-surface-container rounded-xl">
            {([['chapters', 'Chapters'], ['analytics', 'Analytics']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                  tab === key
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'chapters' && (
            <div className="space-y-md">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">{chapter.icon || 'menu_book'}</span>
                    </div>
                    <div>
                      <h3 className="font-label-md text-on-surface block">{chapter.title}</h3>
                      <span className="font-caption text-on-surface-variant">
                        Order: {chapter.order} • {chapter.questionSets?.length || 0} question sets
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(chapter._id)}
                      className={`px-3 py-1 rounded-full font-label-md text-label-md ${
                        chapter.isPublished
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {chapter.isPublished ? 'Published' : 'Draft'}
                    </button>
                    <Link
                      to={`/admin/chapters/${chapter._id}`}
                      className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant">edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(chapter._id)}
                      className="p-2 rounded-lg hover:bg-error-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-error">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {chapters.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">menu_book</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No chapters yet</h3>
                  <p className="font-body-md text-on-surface-variant mb-4">Create your first chapter to get started.</p>
                  <Link
                    to="/admin/chapters/new"
                    className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold inline-block"
                  >
                    Create Chapter
                  </Link>
                </div>
              )}
            </div>
          )}

          {tab === 'analytics' && analytics && (
            <div className="space-y-xl">
              <div className="grid grid-cols-2 gap-md">
                <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] text-center">
                  <span className="material-symbols-outlined text-primary mb-1">group</span>
                  <span className="font-headline-md text-headline-md text-on-surface block">{analytics.summary.totalUsers}</span>
                  <span className="font-caption text-caption text-on-surface-variant">Total Users</span>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] text-center">
                  <span className="material-symbols-outlined text-secondary mb-1">assignment</span>
                  <span className="font-headline-md text-headline-md text-on-surface block">{analytics.summary.totalAttempts}</span>
                  <span className="font-caption text-caption text-on-surface-variant">Total Attempts</span>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] text-center">
                  <span className="material-symbols-outlined text-tertiary mb-1">trending_up</span>
                  <span className="font-headline-md text-headline-md text-on-surface block">{analytics.summary.overallAvg}</span>
                  <span className="font-caption text-caption text-on-surface-variant">Avg Score (/10)</span>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] text-center">
                  <span className="material-symbols-outlined text-primary mb-1">visibility</span>
                  <span className="font-headline-md text-headline-md text-on-surface block">{analytics.summary.todayVisitors}</span>
                  <span className="font-caption text-caption text-on-surface-variant">Today Visitors</span>
                </div>
              </div>

              {analytics.dailyVisitors.length > 0 && (
                <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)]">
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-md">Daily Visitors (Last 7 Days)</h3>
                  <div className="flex items-end gap-2 h-32">
                    {analytics.dailyVisitors.map((day: any) => {
                      const maxVisitors = Math.max(...analytics.dailyVisitors.map((d: any) => d.visitors), 1);
                      const height = (day.visitors / maxVisitors) * 100;
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="font-caption text-caption text-on-surface-variant">{day.visitors}</span>
                          <div
                            className="w-full bg-primary/80 rounded-t-md min-h-[4px] transition-all"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          />
                          <span className="font-caption text-[10px] text-on-surface-variant">
                            {day.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {analytics.chapterStats.length > 0 && (
                <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)]">
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-md">Chapter Rankings</h3>
                  <div className="space-y-sm">
                    {analytics.chapterStats.map((ch: any, i: number) => (
                      <div key={ch.slug} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md font-bold ${
                          i === 0 ? 'bg-secondary-container text-on-secondary-container' :
                          i === 1 ? 'bg-surface-container-high text-on-surface' :
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-label-md text-on-surface block truncate">{ch.title}</span>
                          <span className="font-caption text-caption text-on-surface-variant">
                            {ch.attempts} attempts • {ch.accuracy}% accuracy
                          </span>
                        </div>
                        <span className="font-label-md text-primary font-bold">{ch.avgScorePercent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics.userRanking.length > 0 && (
                <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)]">
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold mb-md">User Leaderboard</h3>
                  <div className="space-y-sm">
                    {analytics.userRanking.map((u: any, i: number) => (
                      <div key={u.email} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md font-bold ${
                          i === 0 ? 'bg-secondary-container text-on-secondary-container' :
                          i === 1 ? 'bg-surface-container-high text-on-surface' :
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-label-md text-on-surface truncate">{u.name}</span>
                            {u.role === 'admin' && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                            )}
                          </div>
                          <span className="font-caption text-caption text-on-surface-variant">
                            {u.attempts} attempts • {u.totalCorrect} correct • {u.accuracy}% accuracy
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'analytics' && !analytics && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">bar_chart</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No analytics yet</h3>
              <p className="font-body-md text-on-surface-variant">Data will appear once users start taking tests.</p>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
