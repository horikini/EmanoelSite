import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Ops! Ocorreu um erro no aplicativo.</h2>
            <p className="text-slate-600 mb-4">{this.state.error?.message || 'Um erro inesperado acontenceu.'}</p>
            {this.state.error?.message === 'Failed to fetch' && (
              <p className="text-sm text-slate-500 mb-4">
                O erro "Failed to fetch" geralmente ocorre quando não é possível se conectar ao banco de dados Supabase. Verifique se você configurou as variáveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
