import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { chaptersAPI, progressAPI } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import type { IChapter, IUserProgress } from '../types';
import StarRating from '../components/StarRating';
import RadarChart from '../components/RadarChart';
import LockModal from '../components/LockModal';

type Tab = 'study' | 'practice' | 'challenge' | 'vocab' | 'progress';

export default function ChapterDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [chapter, setChapter] = useState<IChapter | null>(null);
  const [progress, setProgress] = useState<IUserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('study');
  const [cardsRead, setCardsRead] = useState<Set<string>>(new Set());
  const [isLocked, setIsLocked] = useState(false);
  const [lockModal, setLockModal] = useState(false);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      chaptersAPI.getBySlug(slug),
      chaptersAPI.getBySlug(slug).then(({ chapter }) =>
        progressAPI.get(chapter._id).then(({ progress }) => progress)
      ),
      chaptersAPI.listWithProgress(),
    ])
      .then(([chapterData, progressData, listData]) => {
        setChapter(chapterData.chapter);
        setProgress(progressData);
        setCardsRead(new Set(progressData.cardsRead || []));

        const chapterInfo = listData.chapters.find((ch: any) => ch.slug === slug);
        if (chapterInfo?.isLocked && user?.role !== 'admin') {
          setIsLocked(true);
          setLockModal(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleMarkCard = async (topic: string) => {
    if (!chapter) return;
    const newCardsRead = new Set([...cardsRead, topic]);
    setCardsRead(newCardsRead);
    progressAPI.markCard(chapter._id, topic).catch(console.error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Chapter not found</p>
      </div>
    );
  }

  const practiceSet = chapter.questionSets.find((s) => s.type === 'practice');
  const testSet = chapter.questionSets.find((s) => s.type === 'test');
  const subTopics = chapter.subTopics || [];

  // Parse sub-topic cards from notes
  const cardTopics = subTopics.map((topic) => ({
    topic,
    title: topic.charAt(0).toUpperCase() + topic.slice(1),
    isRead: cardsRead.has(topic),
  }));

  const readCount = cardTopics.filter((c) => c.isRead).length;
  const readPercent = cardTopics.length > 0 ? Math.round((readCount / cardTopics.length) * 100) : 0;

  // Radar chart values
  const radarValues = subTopics.map(() => {
    if (progress?.status === 'mastered') return 100;
    if (progress?.challengeScore) return Math.min(progress.challengeScore, 100);
    if (cardsRead.size > 0) return Math.round((cardsRead.size / subTopics.length) * 50);
    return 0;
  });

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'study', label: 'Study', icon: 'book' },
    { id: 'practice', label: 'Practice', icon: 'quiz' },
    { id: 'challenge', label: 'Challenge', icon: 'rocket_launch' },
    { id: 'vocab', label: 'Vocab', icon: 'translate' },
    { id: 'progress', label: 'Progress', icon: 'bar_chart' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="bg-background fixed md:static top-0 w-full z-50 h-16 flex items-center px-container-padding gap-4 border-b border-outline-variant">
        <Link to="/modules" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface truncate">{chapter.title}</h1>
            {progress && progress.stars > 0 && <StarRating stars={progress.stars} size="sm" />}
          </div>
          <p className="font-caption text-caption text-on-surface-variant">{chapter.readTimeMinutes} min read • {chapter.difficulty}</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="fixed md:static top-16 w-full z-40 bg-background border-b border-outline-variant">
        <div className="flex overflow-x-auto px-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 font-label-md text-label-md whitespace-nowrap transition-colors border-b-2 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-[768px] mx-auto px-container-padding pt-4">
        {/* STUDY TAB */}
        {activeTab === 'study' && (
          <div className="space-y-4">
            <div className="bg-surface-container-lowest rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-on-surface-variant">Study Progress</span>
                <span className="font-label-md text-primary">{readCount}/{subTopics.length}</span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${readPercent}%` }} />
              </div>
            </div>

            <article
              className="notes-content font-body-md text-body-md text-on-surface-variant leading-relaxed"
              dangerouslySetInnerHTML={{ __html: chapter.notes }}
            />

            <div className="flex gap-3 pt-4">
              {practiceSet && (
                <button
                  onClick={() => setActiveTab('practice')}
                  className="flex-1 h-12 rounded-xl border-2 border-primary text-primary font-label-md font-bold uppercase tracking-wider hover:bg-primary/5 active:scale-95 transition-all"
                >
                  Practice
                </button>
              )}
              {testSet && (
                <button
                  onClick={() => setActiveTab('challenge')}
                  className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-label-md font-bold uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  Challenge
                </button>
              )}
            </div>
          </div>
        )}

        {/* PRACTICE TAB */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {progress?.practiceCompleted && (
              <div className="bg-primary-fixed/20 rounded-xl p-4">
                <p className="font-label-md text-primary font-semibold">Practice Complete!</p>
                <p className="font-body-md text-on-surface-variant">Best score: {progress.practiceScore}%</p>
              </div>
            )}
            <div className="text-center space-y-4 py-8">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '64px' }}>quiz</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Ready to Practice?</h2>
              <p className="font-body-md text-on-surface-variant">
                {practiceSet ? `${practiceSet.questions.length} questions • Instant feedback` : 'No practice questions available'}
              </p>
              {practiceSet && (
                <Link
                  to={`/modules/${slug}/practice/${practiceSet._id}`}
                  className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-xl font-label-md font-bold hover:opacity-90 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  Start Practice
                </Link>
              )}
            </div>
          </div>
        )}

        {/* CHALLENGE TAB */}
        {activeTab === 'challenge' && (
          <div className="space-y-6">
            {progress?.challengeCompleted && (
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-on-surface font-semibold">Challenge Complete!</p>
                    <p className="font-body-md text-on-surface-variant">Best score: {progress.challengeScore}%</p>
                  </div>
                  <StarRating stars={progress.stars} />
                </div>
              </div>
            )}
            <div className="text-center space-y-4 py-8">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '64px' }}>rocket_launch</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Challenge Mode</h2>
              <p className="font-body-md text-on-surface-variant">
                {testSet ? `${testSet.questions.length} questions • ${testSet.timeLimitMinutes || 3} min timer • Score ≥90% = 3 stars` : 'No challenge questions available'}
              </p>
              {testSet && (
                <Link
                  to={`/modules/${slug}/test/${testSet._id}`}
                  className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-xl font-label-md font-bold hover:opacity-90 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Start Challenge
                </Link>
              )}
            </div>
          </div>
        )}

        {/* VOCAB TAB */}
        {activeTab === 'vocab' && (
          <div className="space-y-6">
            {chapter.vocab.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>translate</span>
                <p className="font-body-md text-on-surface-variant mt-2">No vocabulary for this lesson yet.</p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-4 py-4">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px' }}>translate</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Vocabulary Builder</h2>
                  <p className="font-body-md text-on-surface-variant">{chapter.vocab.length} words to master</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {chapter.vocab.map((v) => {
                    const vocabProgress = progress?.vocabStagesCompleted.find((vs) => vs.word === v.word);
                    const stagesDone = vocabProgress?.stages.length || 0;
                    const isMastered = stagesDone >= 4;
                    return (
                      <div key={v._id} className={`bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 ${isMastered ? 'border-l-4 border-primary' : ''}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-body-md font-bold text-on-surface">{v.word}</h4>
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-caption text-caption">{v.partOfSpeech}</span>
                            {isMastered && <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>}
                          </div>
                          <p className="font-caption text-on-surface-variant mt-1">{v.meaning}</p>
                          <div className="flex gap-1 mt-2">
                            {['learn', 'recall', 'match', 'use'].map((s) => (
                              <div
                                key={s}
                                className={`w-2 h-2 rounded-full ${
                                  vocabProgress?.stages.includes(s) ? 'bg-primary' : 'bg-surface-variant'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link
                  to={`/modules/${slug}/vocab`}
                  className="block w-full bg-primary text-on-primary text-center py-3 rounded-xl font-label-md font-bold hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Start Learning Words
                </Link>
              </>
            )}
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-5">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-4">Chapter Mastery</h3>
              {subTopics.length > 0 && (
                <RadarChart topics={subTopics} values={radarValues} size={220} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-lowest rounded-xl p-4 text-center">
                <StarRating stars={progress?.stars || 0} size="lg" />
                <p className="font-label-md text-on-surface-variant mt-2">Stars</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 text-center">
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
                  {progress?.challengeScore || 0}%
                </span>
                <p className="font-label-md text-on-surface-variant mt-2">Best Score</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 text-center">
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
                  {cardsRead.size}/{subTopics.length}
                </span>
                <p className="font-label-md text-on-surface-variant mt-2">Cards Read</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 text-center">
                <span className={`font-headline-lg-mobile text-headline-lg-mobile font-bold ${
                  progress?.status === 'mastered' ? 'text-primary' : progress?.status === 'completed' ? 'text-secondary' : 'text-on-surface-variant'
                }`}>
                  {progress?.status === 'mastered' ? 'Mastered' : progress?.status === 'completed' ? 'Complete' : progress?.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                </span>
                <p className="font-label-md text-on-surface-variant mt-2">Status</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {lockModal && chapter && (
        <LockModal
          chapterId={chapter._id}
          chapterTitle={chapter.title}
          onClose={() => {
            setLockModal(false);
            navigate('/modules');
          }}
          onUnlocked={() => {
            setLockModal(false);
            setIsLocked(false);
          }}
        />
      )}
    </div>
  );
}
