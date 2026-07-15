import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptsAPI } from '../lib/api';

export default function TestResult() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!attemptId) return;
    attemptsAPI.getById(attemptId)
      .then((data) => setAttempt(data.attempt))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Attempt not found</p>
      </div>
    );
  }

  const scorePercent = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const circumference = 2 * Math.PI * 80;
  const dashoffset = circumference - (scorePercent / 100) * circumference;

  const toggleQuestion = (id: string) => {
    const next = new Set(expandedQuestions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedQuestions(next);
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center">
      <header className="bg-background flex items-center justify-between px-container-padding h-16 w-full max-w-[768px] mx-auto sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="material-symbols-outlined text-primary active:scale-95 transition-transform">close</button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">IELTS Prep</h1>
        </div>
      </header>

      <main className="w-full max-w-[768px] px-container-padding pb-32 flex-grow overflow-y-auto">
        <section className="flex flex-col items-center py-xl text-center">
          <div className="relative w-48 h-48 flex items-center justify-center mb-lg">
            <svg className="w-full h-full">
              <circle className="text-surface-container-high stroke-current" cx="96" cy="96" fill="transparent" r="80" strokeWidth="12" />
              <circle
                className="text-primary-container stroke-current progress-ring-circle"
                cx="96" cy="96" fill="transparent" r="80"
                strokeLinecap="round" strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-display text-primary">{attempt.score} / {attempt.totalQuestions}</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Correct</span>
            </div>
          </div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
            {scorePercent >= 80 ? 'Excellent work!' : scorePercent >= 60 ? 'Great effort!' : 'Keep practicing!'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {scorePercent >= 80
              ? 'Outstanding performance! You really know your grammar.'
              : scorePercent >= 60
                ? "You're making progress. Keep focusing on your weak areas."
                : "Don't give up! Review the explanations and try again."}
          </p>
        </section>

        <section className="space-y-gutter">
          <h3 className="font-label-md text-label-md text-on-surface-variant px-1">Questions Summary</h3>

          {attempt.answers?.map((ans: any, i: number) => (
            <div
              key={ans.questionId}
              className={`bg-surface-container-lowest rounded-xl p-md shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] border-l-4 ${
                ans.isCorrect ? 'border-primary' : 'border-error'
              }`}
            >
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => !ans.isCorrect && toggleQuestion(ans.questionId)}
              >
                <div className="flex gap-md">
                  <span className={`material-symbols-outlined mt-1 ${ans.isCorrect ? 'text-primary' : 'text-error'}`}>
                    {ans.isCorrect ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Question {i + 1}</p>
                    <p className="font-body-md text-body-md text-on-surface">{ans.prompt || `Question ${i + 1}`}</p>
                    {!ans.isCorrect && (
                      <div className="mt-2 flex items-center gap-xs">
                        <span className="text-error font-bold line-through text-label-md">{ans.userAnswer}</span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[14px]">arrow_forward</span>
                        <span className="text-primary font-bold text-label-md">{ans.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
                {!ans.isCorrect && (
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${
                    expandedQuestions.has(ans.questionId) ? 'rotate-180' : ''
                  }`}>
                    expand_more
                  </span>
                )}
              </div>

              {expandedQuestions.has(ans.questionId) && (
                <div className="mt-md pt-md border-t border-surface-variant animate-slide-up">
                  <div className="bg-surface-container-low rounded-lg p-md">
                    <h4 className="font-label-md text-label-md text-primary mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                      Why?
                    </h4>
                    <p className="font-caption text-caption text-on-surface-variant">
                      {ans.justification || 'Review the study notes for this chapter to understand the correct answer.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-surface-container-lowest shadow-[0_-4px_12px_0px_rgba(0,0,0,0.05)] rounded-t-xl p-lg flex flex-col gap-md z-50">
        <div className="flex gap-gutter">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border-2 border-primary text-primary font-label-md text-label-md py-3 rounded-xl hover:bg-surface-container-high transition-colors active:scale-95"
          >
            Retry Test
          </button>
          <Link
            to="/mistakes"
            className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-3 rounded-xl shadow-lg active:scale-95 transition-transform text-center"
          >
            Review Mistakes
          </Link>
        </div>
        <button
          onClick={() => navigate('/modules')}
          className="text-on-surface-variant font-label-md text-label-md flex items-center justify-center gap-1 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Chapters
        </button>
      </div>
    </div>
  );
}
