import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chaptersAPI, progressAPI } from '../lib/api';
import type { IChapter, IVocabItem } from '../types';
import FlashCard from '../components/FlashCard';

type Stage = 'learn' | 'recall' | 'match' | 'use';

export default function VocabMode() {
  const { slug } = useParams<{ slug: string }>();
  const [chapter, setChapter] = useState<IChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>('learn');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [recalledWords, setRecalledWords] = useState<Set<string>>(new Set());
  const [matchedWords, setMatchedWords] = useState<Set<string>>(new Set());
  const [sentenceWord, setSentenceWord] = useState('');
  const [sentenceText, setSentenceText] = useState('');
  const [sentenceSent, setSentenceSent] = useState(false);
  const [communitySentences, setCommunitySentences] = useState<any[]>([]);

  // Quiz state
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelected, setQuizSelected] = useState('');
  const [quizCorrect, setQuizCorrect] = useState(false);

  // Match state
  const [matchPairs, setMatchPairs] = useState<{ word: string; meaning: string }[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [matchError, setMatchError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    chaptersAPI.getBySlug(slug)
      .then(({ chapter }) => {
        setChapter(chapter);
        if (chapter.vocab.length > 0) {
          setSentenceWord(chapter.vocab[0].word);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const vocab = chapter?.vocab || [];
  const currentWord = vocab[currentIndex];

  const stages: Stage[] = ['learn', 'recall', 'match', 'use'];
  const stageIndex = stages.indexOf(stage);

  const completedCount = vocab.filter((v) => {
    if (stage === 'learn') return learnedWords.has(v.word);
    if (stage === 'recall') return recalledWords.has(v.word);
    if (stage === 'match') return matchedWords.has(v.word);
    return false;
  }).length;

  // Generate quiz options for recall stage
  const generateQuizOptions = useCallback(() => {
    if (!currentWord || vocab.length < 4) return;
    const others = vocab.filter((v) => v.word !== currentWord.word);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...shuffled.map((v) => v.meaning), currentWord.meaning].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
    setQuizAnswered(false);
    setQuizSelected('');
  }, [currentWord, vocab]);

  useEffect(() => {
    if (stage === 'recall' && currentWord) {
      generateQuizOptions();
    }
    if (stage === 'match' && matchPairs.length === 0 && vocab.length > 0) {
      const pairs = vocab.slice(0, 4).map((v) => ({ word: v.word, meaning: v.meaning }));
      setMatchPairs(pairs.sort(() => Math.random() - 0.5));
    }
  }, [stage, currentWord, vocab, generateQuizOptions, matchPairs.length]);

  const handleLearnNext = async () => {
    if (!currentWord || !chapter) return;
    if (!learnedWords.has(currentWord.word)) {
      setLearnedWords(new Set([...learnedWords, currentWord.word]));
      progressAPI.updateVocab(chapter._id, currentWord.word, 'learn').catch(console.error);
    }
    if (currentIndex < vocab.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStage('recall');
      setCurrentIndex(0);
    }
  };

  const handleRecallAnswer = async (answer: string) => {
    if (quizAnswered || !currentWord || !chapter) return;
    setQuizSelected(answer);
    setQuizAnswered(true);
    const correct = answer === currentWord.meaning;
    setQuizCorrect(correct);
    if (correct && !recalledWords.has(currentWord.word)) {
      setRecalledWords(new Set([...recalledWords, currentWord.word]));
      progressAPI.updateVocab(chapter._id, currentWord.word, 'recall').catch(console.error);
    }
  };

  const handleRecallNext = () => {
    if (currentIndex < vocab.length - 1) {
      setCurrentIndex(currentIndex + 1);
      generateQuizOptions();
    } else {
      setStage('match');
      setCurrentIndex(0);
    }
  };

  const handleMatchWord = (word: string) => {
    if (matchedPairs.has(word)) return;
    setSelectedWord(word);
    setMatchError(false);
    if (selectedMeaning) {
      checkMatchPair(word, selectedMeaning);
    }
  };

  const handleMatchMeaning = async (meaning: string) => {
    if (matchedPairs.has(meaning)) return;
    setSelectedMeaning(meaning);
    setMatchError(false);
    if (selectedWord) {
      await checkMatchPair(selectedWord, meaning);
    }
  };

  const checkMatchPair = async (word: string, meaning: string) => {
    if (!chapter) return;
    const pair = matchPairs.find((p) => p.word === word);
    if (pair && pair.meaning === meaning) {
      const newMatched = new Set([...matchedPairs, word, meaning]);
      setMatchedPairs(newMatched);
      setMatchedWords(new Set([...matchedWords, word]));
      setSelectedWord(null);
      setSelectedMeaning(null);
      progressAPI.updateVocab(chapter._id, word, 'match').catch(console.error);

      if (newMatched.size === matchPairs.length * 2) {
        setTimeout(() => setStage('use'), 500);
      }
    } else {
      setMatchError(true);
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedMeaning(null);
        setMatchError(false);
      }, 800);
    }
  };

  const handleSentenceSubmit = async () => {
    if (!sentenceText.trim() || !chapter || !sentenceWord) return;
    await progressAPI.addSentence(chapter._id, sentenceWord, sentenceText.trim()).catch(console.error);
    setSentenceSent(true);
    setSentenceText('');
    setTimeout(() => setSentenceSent(false), 2000);
  };

  const handleSentenceWordChange = async (word: string) => {
    setSentenceWord(word);
    setSentenceSent(false);
    if (chapter) {
      const { sentences } = await progressAPI.getSentences(chapter._id, word).catch(() => ({ sentences: [] }));
      setCommunitySentences(sentences);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!chapter || vocab.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-container-padding">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px' }}>menu_book</span>
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">No Vocabulary Yet</h2>
        <Link to="/modules" className="text-primary font-label-md hover:underline">Back to Modules</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <header className="bg-background fixed md:static top-0 w-full z-50 h-16 flex items-center px-container-padding gap-4">
        <Link to={`/modules/${slug}`} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Vocabulary</h1>
          <p className="font-caption text-caption text-on-surface-variant">{chapter.title}</p>
        </div>
      </header>

      {/* Stage Tabs */}
      <div className="fixed md:static top-16 w-full z-40 bg-background border-b border-outline-variant">
        <div className="flex overflow-x-auto px-container-padding">
          {stages.map((s, i) => (
            <button
              key={s}
              onClick={() => { setStage(s); setCurrentIndex(0); }}
              className={`flex items-center gap-2 px-4 py-3 font-label-md text-label-md whitespace-nowrap transition-colors border-b-2 ${
                stage === s
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {s === 'learn' ? 'visibility' : s === 'recall' ? 'quiz' : s === 'match' ? 'swap_horiz' : 'edit_note'}
              </span>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-[768px] mx-auto px-container-padding pt-4">
        {/* LEARN STAGE */}
        {stage === 'learn' && (
          <div className="space-y-4">
            <FlashCard
              word={currentWord.word}
              meaning={currentWord.meaning}
              example={currentWord.example}
              partOfSpeech={currentWord.partOfSpeech}
              onNext={handleLearnNext}
              onMarkLearned={handleLearnNext}
              index={currentIndex}
              total={vocab.length}
            />
            <div className="flex justify-center gap-2 mt-4">
              {vocab.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < currentIndex ? 'bg-primary' : i === currentIndex ? 'bg-primary animate-pulse' : 'bg-surface-variant'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* RECALL STAGE */}
        {stage === 'recall' && currentWord && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="font-caption text-caption text-on-surface-variant mb-1">What does this word mean?</p>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">{currentWord.word}</h2>
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-caption text-caption mt-2">
                {currentWord.partOfSpeech}
              </span>
            </div>
            <div className="space-y-3">
              {quizOptions.map((option, i) => {
                const isSelected = quizSelected === option;
                const isCorrect = option === currentWord.meaning;
                let style = 'bg-surface-container-lowest border-outline-variant hover:border-primary';
                if (quizAnswered) {
                  if (isCorrect) style = 'bg-primary-fixed/30 border-primary';
                  else if (isSelected && !isCorrect) style = 'bg-error-container/30 border-error';
                  else style = 'bg-surface-container-lowest border-outline-variant opacity-50';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleRecallAnswer(option)}
                    disabled={quizAnswered}
                    className={`w-full p-4 rounded-xl border text-left font-body-md text-on-surface transition-all ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label-md text-label-md text-on-surface-variant">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </div>
                  </button>
                );
              })}
            </div>
            {quizAnswered && (
              <div className={`p-4 rounded-xl ${quizCorrect ? 'bg-primary-fixed/20' : 'bg-error-container/20'}`}>
                <p className={`font-label-md font-semibold ${quizCorrect ? 'text-primary' : 'text-error'}`}>
                  {quizCorrect ? 'Correct!' : 'Not quite'}
                </p>
                <p className="font-body-md text-on-surface-variant mt-1">{currentWord.meaning}</p>
                <button onClick={handleRecallNext} className="mt-3 bg-primary text-on-primary px-6 py-2 rounded-xl font-label-md hover:opacity-90">
                  {currentIndex < vocab.length - 1 ? 'Next Word' : 'Start Matching'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* MATCH STAGE */}
        {stage === 'match' && (
          <div className="space-y-6">
            <p className="font-body-md text-on-surface-variant text-center">Tap a word, then tap its meaning</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="font-label-md text-on-surface-variant font-semibold">Words</p>
                {matchPairs.map((p) => (
                  <button
                    key={p.word}
                    onClick={() => handleMatchWord(p.word)}
                    disabled={matchedPairs.has(p.word)}
                    className={`w-full p-3 rounded-xl text-left font-body-md transition-all ${
                      matchedPairs.has(p.word)
                        ? 'bg-primary-fixed/30 text-primary line-through'
                        : selectedWord === p.word
                          ? 'bg-primary text-on-primary ring-2 ring-primary'
                          : 'bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface'
                    }`}
                  >
                    {p.word}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <p className="font-label-md text-on-surface-variant font-semibold">Meanings</p>
                {matchPairs.map((p) => (
                  <button
                    key={p.meaning}
                    onClick={() => handleMatchMeaning(p.meaning)}
                    disabled={matchedPairs.has(p.meaning)}
                    className={`w-full p-3 rounded-xl text-left font-body-md transition-all ${
                      matchedPairs.has(p.meaning)
                        ? 'bg-primary-fixed/30 text-primary line-through'
                        : selectedMeaning === p.meaning
                          ? 'bg-primary text-on-primary ring-2 ring-primary'
                          : matchError
                            ? 'bg-error-container/30 border border-error text-on-surface'
                            : 'bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface'
                    }`}
                  >
                    {p.meaning.length > 40 ? p.meaning.substring(0, 37) + '...' : p.meaning}
                  </button>
                ))}
              </div>
            </div>
            {matchedPairs.size === matchPairs.length * 2 && (
              <div className="text-center p-4 bg-primary-fixed/20 rounded-xl">
                <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
                <p className="font-headline-md text-on-surface font-bold mt-2">All Matched!</p>
                <button onClick={() => setStage('use')} className="mt-3 bg-primary text-on-primary px-6 py-2 rounded-xl font-label-md hover:opacity-90">
                  Start Writing
                </button>
              </div>
            )}
          </div>
        )}

        {/* USE STAGE */}
        {stage === 'use' && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-5">
              <p className="font-label-md text-on-surface-variant mb-2">Write a sentence using:</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-headline-md text-headline-md text-primary font-bold">{sentenceWord}</span>
                <select
                  value={sentenceWord}
                  onChange={(e) => handleSentenceWordChange(e.target.value)}
                  className="bg-surface-container-low rounded-lg px-3 py-1 font-body-md text-on-surface border border-outline-variant"
                >
                  {vocab.map((v) => (
                    <option key={v.word} value={v.word}>{v.word}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={sentenceText}
                onChange={(e) => setSentenceText(e.target.value)}
                placeholder={`Type a sentence using "${sentenceWord}"...`}
                className="w-full bg-background rounded-xl p-3 font-body-md text-on-surface border border-outline-variant min-h-[100px] resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <div className="flex items-center justify-between mt-3">
                {sentenceSent && (
                  <span className="text-primary font-label-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Saved! +5 XP
                  </span>
                )}
                <button
                  onClick={handleSentenceSubmit}
                  disabled={!sentenceText.trim()}
                  className="ml-auto bg-primary text-on-primary px-6 py-2 rounded-xl font-label-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>

            {communitySentences.length > 0 && (
              <div>
                <h3 className="font-label-md text-on-surface-variant font-semibold mb-3">Community Sentences</h3>
                <div className="space-y-2">
                  {communitySentences.map((s) => (
                    <div key={s._id} className="bg-surface-container-low rounded-xl p-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[16px]">person</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-body-md text-on-surface">{s.sentence}</p>
                        <p className="font-caption text-on-surface-variant mt-1">
                          by {typeof s.userId === 'object' ? s.userId.name : 'Anonymous'} • {s.likes} likes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
