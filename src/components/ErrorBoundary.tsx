import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RoomReady Uncaught React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.hash = '';
    window.location.reload();
  };

  private handleReset = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F6] text-[#1E2229] flex items-center justify-center p-6 antialiased">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-[#E8E5DF] p-8 shadow-xl text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF4E5] flex items-center justify-center text-[#D97706]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-block bg-[#0058A3] text-[#FFDB00] text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase mb-2">
                RoomReady Recovery
              </div>
              <h1 className="text-xl font-bold text-[#1E2229]">
                Studio Encountered a Display Interruption
              </h1>
              <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                The RoomReady interior design studio caught an unexpected rendering state. Your room design presets and catalog remain safe on the server.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl p-3 text-left overflow-auto max-h-40">
                <p className="text-[11px] font-mono text-[#D97706] font-semibold break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-[10px] font-mono text-[#6B7280] mt-1 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0058A3] hover:bg-[#004885] active:scale-[0.98] rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload RoomReady</span>
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#1E2229] bg-[#EAE8E3] hover:bg-[#DCD8D0] active:scale-[0.98] rounded-xl transition-all cursor-pointer border border-[#D5D0C6]"
              >
                <Home className="w-4 h-4 text-[#0058A3]" />
                <span>Reset to Clean Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
