
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logErrorToRemote } from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Log the error to the remote server
    logErrorToRemote(error, `React ErrorBoundary: ${errorInfo.componentStack}`);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border-2 border-slate-100 text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-4xl">
              ⚠️
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Terjadi Kesalahan</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Maaf, aplikasi mengalami kendala teknis. Laporan kesalahan telah dikirimkan ke tim IT kami.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:scale-105 transition-all"
            >
              MUAT ULANG HALAMAN
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-slate-100 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-red-600">{this.state.error?.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
