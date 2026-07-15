import { useState } from 'react';

interface FlashCardProps {
  word: string;
  meaning: string;
  example: string;
  partOfSpeech: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  onNext?: () => void;
  onMarkLearned?: () => void;
  showActions?: boolean;
  index?: number;
  total?: number;
}

export default function FlashCard({
  word,
  meaning,
  example,
  partOfSpeech,
  isFlipped: controlledFlip,
  onFlip,
  onNext,
  onMarkLearned,
  showActions = true,
  index,
  total,
}: FlashCardProps) {
  const [internalFlip, setInternalFlip] = useState(false);
  const flipped = controlledFlip !== undefined ? controlledFlip : internalFlip;

  const handleFlip = () => {
    if (onFlip) onFlip();
    else setInternalFlip(!internalFlip);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {index !== undefined && total !== undefined && (
        <span className="font-caption text-caption text-on-surface-variant">
          {index + 1} of {total}
        </span>
      )}

      <div
        className="w-full max-w-[360px] h-[280px] relative cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`absolute inset-0 transition-transform duration-500 preserve-3d ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant flex flex-col items-center justify-center p-6">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-caption text-caption mb-4">
              {partOfSpeech}
            </span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold mb-2">
              {word}
            </h2>
            <p className="font-body-md text-on-surface-variant text-center">Tap to reveal meaning</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary-container rounded-2xl shadow-lg flex flex-col items-center justify-center p-6">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-primary-container font-bold mb-3">
              {word}
            </h3>
            <p className="font-body-lg text-on-primary-container text-center mb-4">{meaning}</p>
            <div className="bg-white/20 rounded-xl p-3 w-full">
              <p className="font-body-md text-on-primary-container text-center italic">"{example}"</p>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-3 w-full max-w-[360px]">
          <button
            onClick={handleFlip}
            className="flex-1 bg-surface-container-low rounded-xl py-3 font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors"
          >
            {flipped ? 'Show Front' : 'Flip Card'}
          </button>
          {flipped && onMarkLearned && (
            <button
              onClick={onMarkLearned}
              className="flex-1 bg-primary text-on-primary rounded-xl py-3 font-label-md text-label-md hover:opacity-90 transition-opacity"
            >
              Got it!
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="bg-surface-container-low rounded-xl p-3 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
