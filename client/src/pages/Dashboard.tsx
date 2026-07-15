import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { chaptersAPI, attemptsAPI } from '../lib/api';
import BottomNav from '../components/BottomNav';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, chaptersRes] = await Promise.all([
          attemptsAPI.getStats(),
          chaptersAPI.listWithProgress(),
        ]);
        setStats(statsRes);
        setChapters(chaptersRes.chapters);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCompleted = chapters.filter((ch) => ch.completedAttempts > 0).length;
  const progressPercent = chapters.length > 0 ? Math.round((totalCompleted / chapters.length) * 100) : 0;

  const circumference = 2 * Math.PI * 40;
  const dashoffset = circumference - (progressPercent / 100) * circumference;

  const lastChapter = chapters.find((ch) => ch.completedAttempts > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-background flex items-center justify-between px-container-padding h-16 w-full max-w-[768px] mx-auto sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border-2 border-white shadow-sm">
            <span className="material-symbols-outlined text-on-primary-container">person</span>
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary">IELTS Prep</span>
        </div>
        <Link to="/profile" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </header>

      <main className="max-w-[768px] mx-auto px-container-padding space-y-xl">
        <section className="mt-lg">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-xs">
            Welcome back, {user?.name}!
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-80">
            You're making steady progress today.
          </p>
        </section>

        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-xs">
              <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-caption font-label-md">Current Goal</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Grammar Mastery</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{progressPercent}% Grammar Completed</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-full h-full">
                <circle className="text-surface-container-high" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
                <circle
                  className="text-primary progress-ring-circle"
                  cx="48" cy="48" fill="transparent" r="40"
                  stroke="currentColor"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-label-md text-label-md text-primary font-bold">{progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {lastChapter && (
          <Link
            to={`/modules/${lastChapter.slug}`}
            className="w-full bg-primary-container text-on-primary-container rounded-xl p-lg flex items-center justify-between shadow-[0_8px_20px_0px_rgba(0,0,0,0.08)] hover:opacity-90 transition-opacity active:scale-[0.98] text-left block"
          >
            <div>
              <span className="font-caption text-caption opacity-80 block mb-1">CONTINUE WHERE YOU LEFT OFF</span>
              <span className="font-headline-md text-headline-md">{lastChapter.title}</span>
            </div>
            <div className="bg-on-primary-container/20 p-2 rounded-full">
              <span className="material-symbols-outlined">play_arrow</span>
            </div>
          </Link>
        )}

        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface">Modules</h2>
            <Link to="/modules" className="font-label-md text-label-md text-primary hover:underline">See All</Link>
          </div>
          <div className="grid grid-cols-1 gap-md">
            <Link
              to="/modules"
              className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] flex items-start gap-lg border-l-4 border-primary"
            >
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-headline-md text-headline-md text-on-surface">Grammar</h4>
                  <span className="font-caption text-caption text-primary bg-primary/5 px-2 py-0.5 rounded">Active</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                  Master the essential structures for IELTS Writing and Speaking.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant">
                    {totalCompleted}/{chapters.length} Units
                  </span>
                </div>
              </div>
            </Link>

            <div className="bg-surface-container/50 rounded-xl p-lg flex items-start gap-lg border border-outline-variant grayscale">
              <div className="bg-surface-variant p-3 rounded-xl text-on-surface-variant">
                <span className="material-symbols-outlined">translate</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-headline-md text-headline-md text-on-surface-variant">Vocabulary</h4>
                  <span className="font-caption text-caption bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded">Soon</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant opacity-60">
                  Expand your lexical resource with academic collocations and idioms.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-md">
          <div className="bg-surface-container-low rounded-xl p-md flex flex-col items-center justify-center text-center space-y-1">
            <span className="material-symbols-outlined text-secondary">local_fire_department</span>
            <span className="font-headline-md text-headline-md text-on-surface">{user?.streak || 0} Days</span>
            <span className="font-caption text-caption text-on-surface-variant">Daily Streak</span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-md flex flex-col items-center justify-center text-center space-y-1">
            <span className="material-symbols-outlined text-tertiary">check_circle</span>
            <span className="font-headline-md text-headline-md text-on-surface">{user?.totalCorrect || 0}</span>
            <span className="font-caption text-caption text-on-surface-variant">Correct Answers</span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
