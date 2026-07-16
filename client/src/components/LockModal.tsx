import { useState, useEffect, useRef, useCallback } from 'react';
import { chaptersAPI } from '../lib/api';

interface LockModalProps {
  chapterId: string;
  chapterTitle: string;
  previousChapterTitle?: string;
  onClose: () => void;
  onUnlocked: () => void;
}

type Phase = 'idle' | 'shaking' | 'unlatching' | 'bursting' | 'revealing' | 'done';

export default function LockModal({
  chapterId,
  chapterTitle,
  previousChapterTitle,
  onClose,
  onUnlocked,
}: LockModalProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [unlocking, setUnlocking] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current.forEach(clearTimeout);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startUnlock = async () => {
    setUnlocking(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 3.33, 100));
    }, 100);
    intervalRef.current = progressInterval;

    const schedule = (fn: () => void, delay: number) => {
      const t = setTimeout(fn, delay);
      timerRef.current.push(t);
      return t;
    };

    setPhase('shaking');
    schedule(() => setPhase('unlatching'), 5000);
    schedule(() => setPhase('bursting'), 10000);
    schedule(() => setPhase('revealing'), 20000);
    schedule(() => {
      setPhase('done');
      clearInterval(progressInterval);
      setProgress(100);
      chaptersAPI.unlock(chapterId).catch(console.error);
      schedule(() => onUnlocked(), 1500);
    }, 28000);
  };

  const skipAnimation = () => {
    cleanup();
    setPhase('done');
    setProgress(100);
    chaptersAPI.unlock(chapterId)
      .then(() => onUnlocked())
      .catch(console.error);
  };

  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const rad = (angle * Math.PI) / 180;
    const distance = 60 + Math.random() * 40;
    return {
      tx: Math.cos(rad) * distance,
      ty: Math.sin(rad) * distance,
      delay: Math.random() * 500,
      size: 4 + Math.random() * 6,
    };
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!unlocking ? onClose : undefined}
      />

      <div className="relative w-full max-w-[380px] mx-4 bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        {unlocking && (
          <div className="h-1 bg-surface-container-high">
            <div
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon area */}
          <div className="relative w-24 h-24 mb-6">
            {/* Idle / shaking lock */}
            {(phase === 'idle' || phase === 'shaking') && (
              <div className={`absolute inset-0 flex items-center justify-center ${phase === 'shaking' ? 'animate-lock-shake' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '40px' }}>
                    lock
                  </span>
                </div>
              </div>
            )}

            {/* Unlatching */}
            {phase === 'unlatching' && (
              <div className="absolute inset-0 flex items-center justify-center animate-lock-unlatch">
                <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: '40px' }}>
                    lock_open
                  </span>
                </div>
              </div>
            )}

            {/* Particle burst */}
            {phase === 'bursting' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '40px' }}>
                    lock_open
                  </span>
                </div>
                {particles.map((p, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-primary"
                    style={{
                      width: p.size,
                      height: p.size,
                      left: '50%',
                      top: '50%',
                      marginLeft: -p.size / 2,
                      marginTop: -p.size / 2,
                      ['--tx' as string]: `${p.tx}px`,
                      ['--ty' as string]: `${p.ty}px`,
                      animation: `particle-burst 1.5s ease-out ${p.delay}ms forwards`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Revealing / Done — checkmark */}
            {(phase === 'revealing' || phase === 'done') && (
              <div className="absolute inset-0 flex items-center justify-center animate-unlock-appear">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '40px' }}>
                    {phase === 'done' ? 'check_circle' : 'lock_open'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Text */}
          {phase === 'done' ? (
            <h3 className="font-headline-md text-headline-md text-primary font-bold mb-2 animate-unlock-appear">
              Unlocked!
            </h3>
          ) : (
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
              {unlocking ? 'Unlocking...' : 'Chapter Locked'}
            </h3>
          )}

          {!unlocking ? (
            <>
              <p className="font-body-md text-on-surface-variant mb-2">
                Complete <span className="font-semibold">{previousChapterTitle || 'the previous chapter'}</span> first to unlock this chapter.
              </p>
              <p className="font-body-sm text-on-surface-variant/60 mb-6">
                Or unlock it now to study at your own pace.
              </p>

              <button
                onClick={startUnlock}
                className="w-full py-3 rounded-xl border-2 border-primary text-primary font-label-md text-label-md font-bold hover:bg-primary/5 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">lock_open</span>
                Unlock "{chapterTitle}"
              </button>
            </>
          ) : phase !== 'done' ? (
            <>
              <p className="font-body-md text-on-surface-variant mb-6">
                {phase === 'shaking' && 'Finding the right key...'}
                {phase === 'unlatching' && 'Almost there...'}
                {phase === 'bursting' && 'Opening the lock...'}
                {phase === 'revealing' && 'Welcome to the chapter!'}
              </p>
              <button
                onClick={skipAnimation}
                className="font-body-sm text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
              >
                Skip animation →
              </button>
            </>
          ) : (
            <p className="font-body-md text-primary font-semibold">
              Opening chapter...
            </p>
          )}

          {/* Close button — only when not unlocking */}
          {!unlocking && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
