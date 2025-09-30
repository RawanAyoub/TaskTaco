import React from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo): void {
    // Intentionally avoid console logging in production; integrate with a logging service if needed
    // e.g., send to Sentry or local diagnostics when offline
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // In a larger app, you could also navigate to a safe route or refresh
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-background p-6">
          <div className="max-w-md w-full border border-border rounded-lg p-6 bg-card shadow-sm text-center">
            <div className="text-3xl mb-2">🌮</div>
            <h1 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">
              The UI hit a snag. You can try again.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md border border-input bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
