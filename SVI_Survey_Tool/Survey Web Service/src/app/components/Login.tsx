import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signIn } from '../lib/auth';
import { useAuth } from './AuthProvider';

// Simple components
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} />;
}

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = signIn(username, password);
    
    if (user) {
      refreshUser();
      // 약간의 딜레이 후 네비게이션
      setTimeout(() => {
        // 관리자는 관리자 페이지로, 일반 사용자는 설문 페이지로
        if (user.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/survey');
        }
        setLoading(false);
      }, 100);
    } else {
      setError('계정명 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
    }
  };

  const handleQuickLogin = (username: string, password: string) => {
    setError('');
    setLoading(true);
    
    const user = signIn(username, password);
    
    if (user) {
      refreshUser();
      // 약간의 딜레이 후 네비게이션
      setTimeout(() => {
        // 관리자는 관리자 페이지로, 일반 사용자는 설문 페이지로
        if (user.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/survey');
        }
        setLoading(false);
      }, 100);
    } else {
      setError('로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
      <div style={{ maxWidth: '500px', width: '100%', padding: '20px' }}>
        {/* 로그인 폼 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '50px 40px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '2em',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '10px',
            color: '#2d3748'
          }}>
            직무역량 자가진단
          </h1>
          <p style={{
            textAlign: 'center',
            color: '#718096',
            marginBottom: '40px',
            fontSize: '0.95em'
          }}>
            Light-SVI 진단 시스템
          </p>

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9em',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <Label htmlFor="username" style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: '500' }}>
                계정명
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="계정명을 입력하세요"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1em',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <Label htmlFor="password" style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: '500' }}>
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1em',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#5a6f77',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.05em',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        {/* 테스트 계정 - 회색 딤 처리 박스 */}
        <div style={{
          background: 'rgba(100, 116, 139, 0.15)',
          backdropFilter: 'blur(4px)',
          borderRadius: '16px',
          padding: '30px',
          marginTop: '30px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <p className="text-sm text-center mb-4" style={{ color: '#475569', fontWeight: '500', fontSize: '0.9em' }}>
            테스트 계정으로 빠른 로그인
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('admin', 'thtuffoq2026@')}
              className="py-3 px-4 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ background: '#4299e1', color: 'white' }}
            >
              👤 관리자 로그인
            </button>
            <button
              onClick={() => handleQuickLogin('user', 'user2026')}
              className="py-3 px-4 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ background: '#48bb78', color: 'white' }}
            >
              👤 사용자 로그인
            </button>
          </div>
          <div className="mt-3 text-xs text-center space-y-1" style={{ color: '#64748b' }}>
            <p>• 관리자: admin / thtuffoq2026@</p>
            <p>• 사용자: user / user2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}