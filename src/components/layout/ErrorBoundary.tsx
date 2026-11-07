import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container max-w-xl py-20">
        <p className="eyebrow text-primary">Something broke</p>
        <h1 className="mt-2 font-display text-4xl font-medium">This page hit an error.</h1>
        <p className="mt-3 text-muted-foreground">It’s on us. Reload to try again, or go back to today’s briefing.</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Button variant="outline" asChild>
            <a href="/">Today’s briefing</a>
          </Button>
        </div>
      </div>
    );
  }
}
