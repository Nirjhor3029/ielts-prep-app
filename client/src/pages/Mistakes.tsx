import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mistakesAPI } from '../lib/api';
import BottomNav from '../components/BottomNav';

export default function Mistakes() {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mistakesAPI.list()
      .then((data) => setMistakes(data.mistakes))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (id: string) => {
    await mistakesAPI.review(id);
    setMistakes(mistakes.map((m) =>
      m._id === id ? { ...m, reviewCount: m.reviewCount + 1 } : m
    ));
  };

  const handleDelete = async (id: string) => {
    await mistakesAPI.delete(id);
    setMistakes(mistakes.filter((m) => m._id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-background fixed top-0 w-full max-w-[768px] left-1/2 -translate-x-1/2 z-50 h-16 flex items-center justify-between px-container-padding">
        <div className="flex items-center gap-4">
          <Link to="/progress" className="active:scale-95 transition-transform text-on-surface-variant hover:opacity-80">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold">Mistake Notebook</h1>
        </div>
      </header>

      <main className="pt-20 px-container-padding max-w-[768px] mx-auto space-y-xl">
        {mistakes.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">check_circle</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No mistakes yet!</h3>
            <p className="font-body-md text-on-surface-variant">Keep practicing and your mistakes will appear here.</p>
          </div>
        ) : (
          <>
            <p className="font-body-md text-on-surface-variant">
              {mistakes.length} items to review
            </p>

            {mistakes.map((mistake) => (
              <div key={mistake._id} className="bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] border-l-4 border-error">
                <div className="flex items-start justify-between">
                  <div className="flex gap-md flex-1">
                    <span className="material-symbols-outlined text-error mt-1">cancel</span>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface mb-2">{mistake.prompt}</p>
                      <div className="flex items-center gap-xs mb-2">
                        <span className="text-error font-bold line-through text-label-md">{mistake.userAnswer}</span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[14px]">arrow_forward</span>
                        <span className="text-primary font-bold text-label-md">{mistake.correctAnswer}</span>
                      </div>
                      <p className="font-caption text-caption text-on-surface-variant">{mistake.justification}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-variant">
                  <button
                    onClick={() => handleReview(mistake._id)}
                    className="text-primary font-label-md text-label-md flex items-center gap-1 hover:opacity-80"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleDelete(mistake._id)}
                    className="text-on-surface-variant font-label-md text-label-md flex items-center gap-1 hover:text-error ml-auto"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      <BottomNav active="progress" />
    </div>
  );
}
