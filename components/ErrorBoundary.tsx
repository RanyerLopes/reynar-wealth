import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    handleGoHome = () => {
        window.location.hash = '/';
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="bg-surface border border-surfaceHighlight rounded-2xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-danger" size={32} />
                        </div>

                        <h1 className="text-xl font-bold text-textMain mb-2">
                            Algo deu errado
                        </h1>

                        <p className="text-textMuted mb-6">
                            Ocorreu um erro inesperado. Por favor, tente novamente.
                        </p>

                        {this.state.error && (
                            <div className="bg-background rounded-lg p-3 mb-6 text-left">
                                <code className="text-xs text-danger/80 break-all">
                                    {this.state.error.message}
                                </code>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                            >
                                <RefreshCw size={18} />
                                Tentar Novamente
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center gap-2 bg-surfaceHighlight text-textMain px-4 py-3 rounded-xl font-medium hover:bg-surfaceHighlight/80 transition-colors"
                            >
                                <Home size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
