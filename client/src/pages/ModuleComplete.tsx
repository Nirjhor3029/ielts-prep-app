import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function ModuleComplete() {
  return (
    <Layout active="modules">
      <div className="min-h-screen text-on-background flex flex-col items-center overflow-x-hidden pb-24 md:pb-8">
        <header className="bg-background flex items-center justify-between px-container-padding h-16 w-full max-w-[768px] mx-auto z-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">school</span>
            <span className="font-headline-md text-headline-md font-bold text-primary">IELTS Prep</span>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[768px] px-container-padding flex flex-col items-center justify-center relative py-12">
          <div className="relative z-10 w-full flex flex-col items-center text-center space-y-xl animate-fade-in">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-secondary-container rounded-full opacity-20 blur-xl animate-pulse" />
              <div className="absolute -bottom-8 -left-4 w-20 h-20 bg-primary-container rounded-full opacity-10 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="w-56 h-56 rounded-full bg-surface-container-lowest shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] flex items-center justify-center p-8">
                <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>
            </div>

            <div className="space-y-md">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background animate-slide-up">
                Module Complete!
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant px-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                You've mastered the essentials of IELTS Grammar. Ready for Vocabulary?
              </p>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_12px_0px_rgba(0,0,0,0.05)] grid grid-cols-2 gap-gutter animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col items-center space-y-xs border-r border-outline-variant">
                <span className="font-label-md text-label-md text-on-surface-variant">Badge Earned</span>
                <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="font-label-md text-label-md font-bold text-on-surface">Grammar Pro</span>
              </div>
              <div className="flex flex-col items-center space-y-xs">
                <span className="font-label-md text-label-md text-on-surface-variant">XP Gained</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">+250</span>
                <span className="font-caption text-caption text-on-surface-variant">Level 4 Reached</span>
              </div>
            </div>

            <div className="w-full flex flex-col space-y-md pt-base animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/modules"
                className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md h-14 rounded-xl shadow-[0_8px_20px_0px_rgba(0,0,0,0.08)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Explore Next Module
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
