import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signIn } from '../lib/auth';
import { useAuth } from './AuthProvider';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = signIn(email, password);
    
    if (user) {
      refreshUser();
      // 관리자는 관리자 페이지로, 일반 사용자는 설문 페이지로
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/survey');
      }
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleQuickLogin = (email: string, password: string) => {
    setError('');
    const user = signIn(email, password);
    
    if (user) {
      refreshUser();
      // 관리자는 관리자 페이지로, 일반 사용자는 설문 페이지로
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/survey');
      }
    } else {
      setError('로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: '#f5f5f5' }}>
      <div className="max-w-md w-full space-y-16">
        {/* 실제 서비스 로직 - 일반 로그인 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d3748' }}>
              로그인
            </h2>
            <p className="text-sm" style={{ color: '#718096' }}>
              직무역량 자가진단 시스템
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#4a5568' }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#cbd5e0' }}
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#4a5568' }}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#cbd5e0' }}
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg" style={{ background: '#fed7d7' }}>
                <p className="text-sm" style={{ color: '#c53030' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
              style={{ background: '#4a5568' }}
            >
              로그인
            </button>
          </form>
        </div>

        {/* 테스트 로직 - 빠른 로그인 (완전히 분리된 카드 + 딤 처리) */}
        <div className="rounded-xl shadow-md p-6 opacity-60 hover:opacity-100 transition-opacity" style={{ background: '#e8eaed' }}>
          <p className="text-sm text-center mb-4 font-medium" style={{ color: '#5a6c7d' }}>
            테스트 계정으로 빠른 로그인
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleQuickLogin('admin@test.com', 'admin123')}
              className="py-3 px-4 rounded-lg text-sm font-semibold transition-all hover:opacity-80 flex items-center justify-center gap-2"
              style={{ background: '#5a6c7d', color: 'white' }}
            >
              <span className="text-lg">👤</span>
              관리자 로그인
            </button>
            <button
              onClick={() => handleQuickLogin('user@test.com', 'user123')}
              className="py-3 px-4 rounded-lg text-sm font-semibold transition-all hover:opacity-80 flex items-center justify-center gap-2"
              style={{ background: '#7c9299', color: 'white' }}
            >
              <span className="text-lg">👤</span>
              사용자 로그인
            </button>
          </div>
          
          <div className="text-xs text-center space-y-1" style={{ color: '#5a6c7d' }}>
            <p>• 관리자: admin@test.com / admin123</p>
            <p>• 사용자: user@test.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}