import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background px-5">
          <div className="text-center space-y-4 max-w-sm">
            <span className="material-symbols-outlined text-6xl text-error/40">error</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Something went wrong</h2>
            <p className="font-body-md text-on-surface-variant">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
