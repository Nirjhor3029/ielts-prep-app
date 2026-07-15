import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chaptersAPI, attemptsAPI } from '../lib/api';

export default function TestMode() {
  const { slug, setId } = useParams<{ slug: string; setId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<any[]>([]);
  const [questionSet, setQuestionSet] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [chapterId, setChapterId] = useState<string>('');

  useEffect(() => {
    if (!slug || !setId) return;
    Promise.all([
      chaptersAPI.getQuestions(slug, setId, 'test'),
      chaptersAPI.getBySlug(slug),
    ])
      .then(([qData, chData]) => {
        setQuestions(qData.questions);
        setQuestionSet(qData.questionSet);
        setChapterId(chData.chapter._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, setId]);

  useEffect(() => {
    if (questionSet?.timeLimitMinutes) {
      setTimer(questionSet.timeLimitMinutes * 60);
    } else {
      setTimer(20 * 60);
    }
  }, [questionSet]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const minutes = Math.floor(Math.max(0, timer) / 60);
  const seconds = Math.max(0, timer) % 60;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    try {
      const answerArray = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
      }));

      const data = await attemptsAPI.create({
        chapterId,
        questionSetId: setId,
        mode: 'test',
        answers: answerArray,
        startedAt: new Date(Date.now() - (questionSet?.timeLimitMinutes || 20) * 60 * 1000 + timer * 1000).toISOString(),
      });

      navigate(`/result/${data.attempt.id}`);
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No questions available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center">
      <header className="sticky top-0 w-full max-w-[768px] bg-background z-50">
        <div className="flex items-center justify-between px-container-padding h-16">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-start text-on-surface-variant hover:opacity-80 active:scale-95">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-60">Mock Exam</span>
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[20px]">timer</span>
              <span className="font-headline-md text-headline-md font-bold tracking-tight tabular-nums">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="w-10" />
        </div>
        <div className="w-full h-[2px] bg-surface-container">
          <div className="h-full bg-primary-container transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="w-full max-w-[768px] px-container-padding pt-8 pb-32 flex-grow flex flex-col gap-xl">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <section className="flex flex-col gap-lg">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface leading-snug">
            {currentQuestion.prompt}
          </h1>

          <div className="flex flex-col gap-md">
            {currentQuestion.options?.map((option: string, i: number) => {
              const isSelected = answers[currentQuestion._id] === option;
              return (
                <label key={i} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name="exam-option"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => handleSelect(currentQuestion._id, option)}
                  />
                  <div className={`flex items-center justify-between p-lg rounded-xl border shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-container bg-on-primary-container/5'
                      : 'border-outline-variant bg-surface-container-lowest group-hover:border-primary/30'
                  }`}>
                    <span className="font-body-md text-body-md text-on-surface pr-4">{option}</span>
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-primary' : 'border-outline-variant'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary scale-100 transition-transform" />}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-background/80 backdrop-blur-md px-container-padding pt-4 pb-8 flex flex-col gap-4">
        <div className="flex items-center gap-md">
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="flex-1 h-14 rounded-full border border-outline-variant font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95"
            >
              Previous
            </button>
          )}
          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="flex-[2] h-14 rounded-full bg-primary text-on-primary font-headline-md text-headline-md font-semibold shadow-[0_8px_20px_rgba(0,104,95,0.25)] hover:opacity-90 active:scale-95 transition-all"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-[2] h-14 rounded-full bg-secondary-container text-on-secondary-container font-headline-md text-headline-md font-bold shadow-lg active:scale-95 transition-all"
            >
              Submit Test
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
