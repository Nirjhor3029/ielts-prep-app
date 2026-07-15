import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chaptersAPI } from '../lib/api';
import BottomNav from '../components/BottomNav';

export default function ChapterList() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chaptersAPI.listWithProgress()
      .then((data) => setChapters(data.chapters))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completedCount = chapters.filter((ch) => ch.completedAttempts > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-background fixed top-0 w-full max-w-[768px] z-50 flex items-center justify-between px-container-padding h-16">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-90">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">Grammar Chapters</h1>
        </div>
      </header>

      <main className="w-full max-w-[768px] pt-20 pb-24 px-container-padding flex flex-col gap-6 mx-auto">
        <div className="relative overflow-hidden rounded-xl bg-primary-container p-6 text-on-primary-container flex justify-between items-end">
          <div className="z-10">
            <p className="font-label-md text-label-md opacity-90 mb-1">Your Progress</p>
            <h2 className="font-headline-md text-headline-md leading-tight mb-4">
              You're doing great,<br />Keep it up!
            </h2>
            <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">stars</span>
              <span className="font-label-md text-label-md">{completedCount} Chapters Completed</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>school</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <h3 className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Available Modules</h3>
          <span className="font-caption text-caption text-primary">{chapters.length} Chapters</span>
        </div>

        <div className="flex flex-col gap-md">
          {chapters.map((chapter) => {
            const progressPercent = chapter.completedAttempts > 0
              ? Math.min(100, Math.round((chapter.completedAttempts / 3) * 100))
              : 0;

            return (
              <Link
                key={chapter._id}
                to={chapter.isLocked ? '#' : `/modules/${chapter.slug}`}
                className={`chapter-card bg-surface-container-lowest rounded-xl p-5 flex items-center gap-4 ${
                  chapter.isLocked ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
                }`}
              >
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary">{chapter.icon || 'menu_book'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-body-md text-body-md font-bold text-on-surface">{chapter.title}</h4>
                    {chapter.isLocked && <span className="material-symbols-outlined text-on-surface-variant text-[16px]">lock</span>}
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {chapter.lastScore ? `Last score: ${chapter.lastScore}` : chapter.isLocked ? 'Complete previous chapter first' : 'Not started'}
                  </p>
                </div>
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle className="text-surface-variant" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="3" />
                    <circle
                      className="text-primary progress-ring-circle"
                      cx="18" cy="18" fill="transparent" r="16"
                      stroke="currentColor"
                      strokeDasharray="100"
                      strokeDashoffset={100 - progressPercent}
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{progressPercent}%</span>
                  </div>
                </div>
              </Link>
            );
          })}

          <div className="mt-4 p-6 bg-secondary-container rounded-xl flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <span className="material-symbols-outlined text-on-secondary-container">lightbulb</span>
            </div>
            <div>
              <h5 className="font-label-md text-label-md font-bold text-on-secondary-container">Quick Tip</h5>
              <p className="font-caption text-caption text-on-secondary-container/80">
                Consistent practice is the key to IELTS success. Try to study a little every day!
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav active="modules" />
    </div>
  );
}
