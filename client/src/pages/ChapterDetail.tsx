import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chaptersAPI } from '../lib/api';

export default function ChapterDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    chaptersAPI.getBySlug(slug)
      .then((data) => setChapter(data.chapter))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

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

  const practiceSet = chapter.questionSets.find((s: any) => s.type === 'practice');
  const testSet = chapter.questionSets.find((s: any) => s.type === 'test');

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] h-16 flex items-center justify-between px-container-padding z-40">
        <div className="flex items-center gap-4">
          <Link to="/modules" className="active:scale-95 transition-transform text-on-surface-variant hover:opacity-80">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">IELTS Prep</h1>
        </div>
      </header>

      <main className="pt-16 pb-32 max-w-[768px] mx-auto px-container-padding">
        <div className="mt-xl mb-xl">
          <div className="inline-flex items-center px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-lg font-label-md text-label-md mb-md">
            Module: {chapter.module}
          </div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">{chapter.title}</h2>
          <div className="flex items-center gap-4 text-on-surface-variant font-caption text-caption">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">schedule</span> {chapter.readTimeMinutes} min read
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> {chapter.difficulty}
            </span>
          </div>
        </div>

        <article
          className="font-body-md text-body-md text-on-surface-variant leading-relaxed"
          dangerouslySetInnerHTML={{ __html: chapter.notes }}
        />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-surface-container-lowest/90 backdrop-blur-md px-container-padding py-lg flex items-center gap-gutter z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.04)]">
        {practiceSet && (
          <Link
            to={`/modules/${slug}/practice/${practiceSet._id}`}
            className="flex-1 h-14 rounded-xl border-2 border-primary text-primary font-label-md text-label-md font-bold uppercase tracking-wider hover:bg-primary/5 active:scale-95 transition-all flex items-center justify-center"
          >
            Practice
          </Link>
        )}
        {testSet && (
          <Link
            to={`/modules/${slug}/test/${testSet._id}`}
            className="flex-1 h-14 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Take Test</span>
            <span className="material-symbols-outlined">rocket_launch</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
