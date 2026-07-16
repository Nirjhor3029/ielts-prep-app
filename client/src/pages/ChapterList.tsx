import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chaptersAPI } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import Layout from '../components/Layout';
import LockModal from '../components/LockModal';

const PHASE_DESCRIPTIONS: Record<string, string> = {
  'Phase 1: Grammar Foundations': 'Master the building blocks of English grammar — from parts of speech to complex tenses.',
};

function ChapterCard({ chapter, globalIndex, chapters, user, onLock }: {
  chapter: any;
  globalIndex: number;
  chapters: any[];
  user: any;
  onLock: (data: { chapterId: string; chapterTitle: string; previousTitle?: string }) => void;
}) {
  const progressPercent = chapter.completedAttempts > 0
    ? Math.min(100, Math.round((chapter.completedAttempts / 3) * 100))
    : 0;

  const handleClick = (e: React.MouseEvent) => {
    if (chapter.isLocked && user?.role !== 'admin') {
      e.preventDefault();
      const prevChapter = globalIndex > 0 ? chapters[globalIndex - 1] : null;
      onLock({
        chapterId: chapter._id,
        chapterTitle: chapter.title,
        previousTitle: prevChapter?.title,
      });
    }
  };

  return (
    <Link
      key={chapter._id}
      to={`/modules/${chapter.slug}`}
      onClick={handleClick}
      className={`chapter-card bg-surface-container-lowest rounded-xl p-4 flex items-center gap-3 ${
        chapter.isLocked && user?.role !== 'admin'
          ? 'ring-2 ring-outline-variant/30 cursor-pointer'
          : 'cursor-pointer'
      }`}
    >
      <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg shrink-0">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>{chapter.icon || 'menu_book'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-body-sm text-body-sm font-bold text-on-surface truncate">{chapter.title}</h4>
          {chapter.isLocked && user?.role !== 'admin' && (
            <span className="material-symbols-outlined text-on-surface-variant text-[14px] shrink-0">lock</span>
          )}
        </div>
        <p className="font-caption text-caption text-on-surface-variant truncate">
          {chapter.lastScore ? `Last score: ${chapter.lastScore}` : chapter.isLocked && user?.role !== 'admin' ? 'Tap to unlock' : `${chapter.readTimeMinutes || 10} min`}
        </p>
      </div>
      <div className="relative w-10 h-10 shrink-0">
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
          {chapter.isLocked && user?.role !== 'admin' ? (
            <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '14px' }}>lock_open</span>
          ) : (
            <span className="text-[9px] font-bold text-primary">{progressPercent}%</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ChapterList() {
  const { user } = useAuthStore();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockModal, setLockModal] = useState<{ chapterId: string; chapterTitle: string; previousTitle?: string } | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());

  useEffect(() => {
    chaptersAPI.listWithProgress()
      .then((data) => setChapters(data.chapters))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const togglePhase = (phase: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  const completedCount = chapters.filter((ch) => ch.completedAttempts > 0).length;

  if (loading) {
    return (
      <Layout active="modules">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (chapters.length === 0) {
    return (
      <Layout active="modules">
        <div className="min-h-screen pb-24 md:pb-8">
          <header className="bg-background fixed md:static top-0 w-full z-50 flex items-center justify-between px-container-padding h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-90 md:hidden">
                <span className="material-symbols-outlined text-primary">arrow_back</span>
              </Link>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">Grammar Chapters</h1>
            </div>
          </header>

          <main className="w-full max-w-[768px] pt-20 md:pt-6 pb-24 px-container-padding flex flex-col items-center justify-center text-center gap-lg">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px' }}>menu_book</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">No Chapters Yet</h2>
              <p className="font-body-md text-on-surface-variant">Chapters will appear here once an admin adds them. Check back soon!</p>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  // Group chapters by phaseTitle
  const phaseMap = new Map<string, any[]>();
  for (const ch of chapters) {
    const phase = ch.phaseTitle || '';
    if (!phaseMap.has(phase)) phaseMap.set(phase, []);
    phaseMap.get(phase)!.push(ch);
  }

  // If no chapters have phaseTitle, fall back to flat grouping by moduleTitle
  const hasPhases = chapters.some((ch) => ch.phaseTitle);

  return (
    <Layout active="modules">
      <div className="min-h-screen pb-24 md:pb-8">
        <header className="bg-background fixed md:static top-0 w-full z-50 flex items-center justify-between px-container-padding h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-90 md:hidden">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </Link>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">Grammar Chapters</h1>
          </div>
        </header>

        <main className="w-full max-w-[768px] pt-20 md:pt-6 pb-24 px-container-padding flex flex-col gap-6 mx-auto">
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
            <h3 className="font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Learning Path</h3>
            <span className="font-caption text-caption text-primary">{chapters.length} Chapters</span>
          </div>

          <div className="flex flex-col gap-6">
            {hasPhases ? (
              // Phase-based hierarchy
              Array.from(phaseMap.entries()).map(([phaseTitle, phaseChapters]) => {
                const isCollapsed = collapsedPhases.has(phaseTitle);
                const phaseTime = phaseChapters.reduce((sum, ch) => sum + (ch.readTimeMinutes || 10), 0);
                const phaseCompleted = phaseChapters.filter((ch) => ch.completedAttempts > 0).length;
                const description = PHASE_DESCRIPTIONS[phaseTitle];

                // Separate standalone vs grouped
                const standalone = phaseChapters.filter((ch) => !ch.chapterGroup);
                const grouped = phaseChapters.filter((ch) => ch.chapterGroup);

                // Group by chapterGroup
                const chapterGroups = new Map<string, any[]>();
                for (const ch of grouped) {
                  const group = ch.chapterGroup;
                  if (!chapterGroups.has(group)) chapterGroups.set(group, []);
                  chapterGroups.get(group)!.push(ch);
                }

                return (
                  <div key={phaseTitle} className="flex flex-col rounded-2xl border border-outline-variant/30 overflow-hidden">
                    {/* Phase Header — clickable */}
                    <button
                      onClick={() => togglePhase(phaseTitle)}
                      className="w-full flex items-center gap-3 p-4 bg-surface-container-low hover:bg-surface-container transition-colors text-left"
                    >
                      <span className={`material-symbols-outlined text-primary transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} style={{ fontSize: '20px' }}>chevron_right</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">{phaseTitle}</h3>
                        {description && (
                          <p className="font-caption text-caption text-on-surface-variant mt-0.5 line-clamp-1">{description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-caption text-caption text-on-surface-variant">⏱ ~{phaseTime} min</span>
                        <span className="font-caption text-caption text-primary font-semibold">{phaseCompleted}/{phaseChapters.length}</span>
                      </div>
                    </button>

                    {/* Phase Content — collapsible */}
                    {!isCollapsed && (
                      <div className="flex flex-col gap-4 p-4 pt-2 bg-background">
                        {/* Standalone chapters */}
                        {standalone.length > 0 && (
                          <div className="flex flex-col md:grid md:grid-cols-2 gap-3">
                            {standalone.map((ch) => {
                              const globalIndex = chapters.indexOf(ch);
                              return (
                                <ChapterCard
                                  key={ch._id}
                                  chapter={ch}
                                  globalIndex={globalIndex}
                                  chapters={chapters}
                                  user={user}
                                  onLock={setLockModal}
                                />
                              );
                            })}
                          </div>
                        )}

                        {/* Chapter groups */}
                        {Array.from(chapterGroups.entries()).map(([groupName, groupChapters]) => {
                          // Group by moduleTitle within this chapter group
                          const moduleMap = new Map<string, any[]>();
                          for (const ch of groupChapters) {
                            const mod = ch.moduleTitle || '';
                            if (!moduleMap.has(mod)) moduleMap.set(mod, []);
                            moduleMap.get(mod)!.push(ch);
                          }

                          return (
                            <div key={groupName} className="flex flex-col rounded-xl border border-outline-variant/20 overflow-hidden">
                              {/* Chapter group header */}
                              <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low">
                                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>auto_stories</span>
                                <h4 className="font-label-lg text-label-lg text-on-surface font-bold">{groupName}</h4>
                              </div>

                              {/* Modules within chapter group */}
                              <div className="flex flex-col gap-3 p-4 pt-3">
                                {Array.from(moduleMap.entries()).map(([moduleTitle, moduleChapters]) => (
                                  <div key={moduleTitle} className="flex flex-col gap-2">
                                    {moduleTitle && (
                                      <div className="flex items-center gap-2 px-1">
                                        <div className="w-1 h-4 rounded-full bg-primary" />
                                        <h5 className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">{moduleTitle}</h5>
                                        <span className="font-caption text-caption text-on-surface-variant/60">{moduleChapters.length} lessons</span>
                                      </div>
                                    )}
                                    <div className="flex flex-col md:grid md:grid-cols-2 gap-2">
                                      {moduleChapters.map((ch) => {
                                        const globalIndex = chapters.indexOf(ch);
                                        return (
                                          <ChapterCard
                                            key={ch._id}
                                            chapter={ch}
                                            globalIndex={globalIndex}
                                            chapters={chapters}
                                            user={user}
                                            onLock={setLockModal}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Fallback: flat grouping by moduleTitle (backward compatible)
              (() => {
                const groups: { title: string; chapters: any[] }[] = [];
                let current: { title: string; chapters: any[] } | null = null;
                for (const ch of chapters) {
                  const groupKey = ch.moduleTitle || '';
                  if (!current || current.title !== groupKey) {
                    current = { title: groupKey, chapters: [] };
                    groups.push(current);
                  }
                  current.chapters.push(ch);
                }
                return groups.map((group, gi) => (
                  <div key={gi} className="flex flex-col gap-3">
                    {group.title && (
                      <div className="flex items-center gap-3 px-1">
                        <div className="w-1 h-6 rounded-full bg-primary" />
                        <div className="flex-1 flex items-center justify-between">
                          <h4 className="font-label-lg text-label-lg text-on-surface font-bold">{group.title}</h4>
                          <span className="font-caption text-caption text-on-surface-variant">{group.chapters.filter((c) => c.completedAttempts > 0).length}/{group.chapters.length} completed</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-md">
                      {group.chapters.map((ch) => {
                        const globalIndex = chapters.indexOf(ch);
                        return (
                          <ChapterCard
                            key={ch._id}
                            chapter={ch}
                            globalIndex={globalIndex}
                            chapters={chapters}
                            user={user}
                            onLock={setLockModal}
                          />
                        );
                      })}
                    </div>
                  </div>
                ));
              })()
            )}

            <div className="p-6 bg-secondary-container rounded-xl flex items-center gap-4">
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
      </div>

      {lockModal && (
        <LockModal
          chapterId={lockModal.chapterId}
          chapterTitle={lockModal.chapterTitle}
          previousChapterTitle={lockModal.previousTitle}
          onClose={() => setLockModal(null)}
          onUnlocked={() => {
            setLockModal(null);
            chaptersAPI.listWithProgress()
              .then((data) => setChapters(data.chapters))
              .catch(console.error);
          }}
        />
      )}
    </Layout>
  );
}
