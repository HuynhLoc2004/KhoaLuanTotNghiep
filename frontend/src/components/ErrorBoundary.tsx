import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 24,
            margin: '20px auto',
            maxWidth: 500,
            background: '#FEF2F2',
            border: '1.5px solid #F87171',
            borderRadius: 12,
            textAlign: 'center',
            color: '#991B1B',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
          }}
        >
          <AlertCircle size={40} style={{ margin: '0 auto 12px', color: '#DC2626' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            {this.props.fallbackTitle || 'Đã xảy ra sự cố hiển thị'}
          </h3>
          <p style={{ fontSize: 13, color: '#7F1D1D', marginBottom: 16, lineHeight: 1.5 }}>
            {this.state.error?.message || 'Không thể hiển thị thành phần này.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                background: '#DC2626',
                color: '#FFF',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                background: '#FFF',
                color: '#374151',
                border: '1px solid #D1D5DB',
                cursor: 'pointer'
              }}
            >
              <span>Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
