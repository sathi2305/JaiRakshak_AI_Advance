import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('JalRakshak ErrorBoundary intercepted exception:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-4xl mx-auto my-8">
          <div className="bg-white rounded-2xl border-2 border-rose-200 p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {this.props.fallbackTitle || 'Navigation Matrix View Interrupted'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  An isolated rendering error was caught by the JalRakshak Resilient Error Shield. The rest of the platform remains active.
                </p>
              </div>
            </div>

            {/* Error Message Details */}
            <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-200 overflow-x-auto space-y-2 border border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>{this.state.error?.name || 'Runtime Exception'}: {this.state.error?.message || 'Unknown error encountered'}</span>
              </div>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[11px] text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {this.state.errorInfo.componentStack.slice(0, 500)}
                </pre>
              )}
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry & Reload Module
              </button>
              <button
                onClick={() => {
                  this.handleReset();
                  window.location.hash = '';
                  // Fallback to reload state if needed
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Re-initialize View
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
