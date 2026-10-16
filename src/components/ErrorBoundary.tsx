import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('pokepwa_save');
      localStorage.removeItem('pokepwa_pokedex_index_v5');
      sessionStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tight">
                Qualcosa è andato storto
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                La vista del gioco ha riscontrato un errore temporaneo nel browser.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-red-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Ricarica Schermata
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all border border-slate-700/60"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                Ricarica e Ripristina Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
