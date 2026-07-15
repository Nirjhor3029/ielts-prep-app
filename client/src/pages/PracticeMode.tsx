import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chaptersAPI, attemptsAPI } from '../lib/api';

export default function PracticeMode() {
  const { slug, setId } = useParams<{ slug: string; setId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<any[]>([]);
  const [questionSet, setQuestionSet] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; userAnswer: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!slug || !setId) return;
    chaptersAPI.getQuestions(slug, setId, 'practice')
      .then((data) => {
        setQuestions(data.questions);
        setQuestionSet(data.questionSet);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, setId]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    setIsCorrect(
      String(currentQuestion.correctAnswer).toLowerCase().trim() === answer.toLowerCase().trim()
    );
    setAnswers([...answers, { questionId: currentQuestion._id, userAnswer: answer }]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      submitAttempt();
    }
  };

  const submitAttempt = async () => {
    try {
      const score = answers.filter((a) => {
        const q = questions.find((q) => q._id === a.questionId);
        return q && String(q.correctAnswer).toLowerCase().trim() === a.userAnswer.toLowerCase().trim();
      }).length;

      const data = await attemptsAPI.create({
        chapterId: questions[0]?._id ? (await chaptersAPI.getBySlug(slug!)).chapter._id : undefined,
        questionSetId: setId,
        mode: 'practice',
        answers,
        startedAt: new Date(Date.now() - timer * 1000).toISOString(),
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
      <header className="w-full max-w-[768px] h-16 flex items-center justify-between px-container-padding fixed top-0 bg-background z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:opacity-80 active:scale-95 transition-all text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Practice Mode</h1>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
          <span className="font-label-md text-label-md text-on-surface-variant">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </header>

      <main className="w-full max-w-[768px] pt-20 px-container-padding pb-32 flex-grow overflow-y-auto">
        <div className="mb-xl">
          <div className="flex justify-between items-center mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="font-label-md text-label-md text-primary font-semibold">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] mb-lg">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-xl leading-relaxed">
            {currentQuestion.prompt}
          </h2>

          <div className="space-y-md">
            {currentQuestion.options?.map((option: string, i: number) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = selectedAnswer === option;
              const isCorrectOption = String(currentQuestion.correctAnswer).toLowerCase().trim() === option.toLowerCase().trim();

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={`w-full p-md rounded-xl border flex items-center gap-4 transition-all ${
                    showFeedback && isCorrectOption
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : showFeedback && isSelected && !isCorrect
                        ? 'border-error bg-error/5'
                        : isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${
                    showFeedback && isCorrectOption
                      ? 'bg-primary text-on-primary'
                      : showFeedback && isSelected && !isCorrect
                        ? 'bg-error text-on-error'
                        : isSelected
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {letter}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface flex-grow text-left">{option}</span>
                  {showFeedback && isCorrectOption && (
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && (
          <div className="space-y-md animate-slide-up">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className={`font-headline-md text-headline-md font-bold ${isCorrect ? 'text-primary' : 'text-error'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <div className={`${isCorrect ? 'bg-primary/5 border-primary/10' : 'bg-error/5 border-error/10'} border rounded-2xl p-lg`}>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {currentQuestion.justification}
              </p>
            </div>
          </div>
        )}
      </main>

      {showFeedback && (
        <footer className="fixed bottom-0 w-full max-w-[768px] bg-background px-container-padding pt-4 pb-8 flex flex-col gap-3">
          <button
            onClick={handleNext}
            className="w-full h-14 bg-primary text-on-primary rounded-2xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </footer>
      )}
    </div>
  );
}
