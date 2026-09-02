"use client";

import React, { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  sectionName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.sectionName ? ` — ${this.props.sectionName}` : ""}]`,
      error,
      errorInfo,
    );
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[120px]">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm font-medium text-red-300">
            {this.props.sectionName
              ? `${this.props.sectionName} failed to load`
              : "Something went wrong"}
          </p>
          <p className="text-xs text-zinc-500 max-w-xs">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
