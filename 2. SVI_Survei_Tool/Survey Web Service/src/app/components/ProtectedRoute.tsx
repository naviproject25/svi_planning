import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
        <div className="text-lg" style={{ color: '#4a5568' }}>로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#e53e3e' }}>
            ⛔ 접근 권한 없음
          </h2>
          <p className="mb-6" style={{ color: '#718096' }}>
            관리자만 접근할 수 있는 페이지입니다.
          </p>
          <a
            href="/survey"
            className="inline-block px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ background: '#4a5568' }}
          >
            설문 페이지로 이동
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
