import { Component, type ErrorInfo, type ReactNode } from "react";
import { errorMessage } from "@/lib/error-message";

interface IErrorBoundaryProps {
  children: ReactNode;
}

interface IErrorBoundaryState {
  error: unknown;
}

/**
 * Catches render-time failures that would otherwise leave a blank window.
 * Async failures are reported by the feature that owns them.
 */
export class ErrorBoundary extends Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  state: IErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): IErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.error !== null) {
      return (
        <main role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-lg font-bold">Something went wrong</h1>
          <p className="max-w-md text-center text-sm opacity-70">
            {errorMessage(this.state.error)}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
