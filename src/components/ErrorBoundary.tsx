import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('Uncaught error in application:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((r) => r.unregister());
        });
      }
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-rose-950 to-slate-900 text-white flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-3xl mx-auto">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-amber-300">Terjadi Kesalahan Tampilan</h2>
            <p className="text-xs text-gray-200 leading-relaxed">
              Aplikasi mengalami kendala saat memuat data atau cache browser lama masih tersimpan.
            </p>
            {this.state.error && (
              <div className="bg-black/40 text-rose-300 p-3 rounded-xl text-left text-[11px] font-mono overflow-auto max-h-32 border border-rose-500/30">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 font-black text-xs rounded-xl shadow-lg transition-all"
              >
                🔄 Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleResetCache}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-red-950 font-black text-xs rounded-xl shadow-lg transition-all"
              >
                🧹 Bersihkan Cache & Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
