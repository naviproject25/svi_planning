import { useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';
import { LogOut } from 'lucide-react';

export function SurveySelect() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
      <div style={{ maxWidth: '600px', width: '100%', padding: '20px' }}>
        {/* 헤더 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2em',
            fontWeight: 'bold',
            color: '#2d3748',
            marginBottom: '8px'
          }}>
            SVI기반 경영진단
          </h1>
          <p style={{
            color: '#718096',
            fontSize: '1em',
            marginBottom: '32px'
          }}>
            진단 유형을 선택해주세요
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {/* 기초 진단 */}
            <button
              onClick={() => navigate('/survey/basic')}
              style={{
                flex: 1,
                maxWidth: '240px',
                padding: '32px 24px',
                background: 'linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%)',
                border: '2px solid #90cdf4',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(66, 153, 225, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h2 style={{ fontSize: '1.3em', fontWeight: '700', color: '#2b6cb0', marginBottom: '8px' }}>
                기초 진단
              </h2>
              <p style={{ fontSize: '0.85em', color: '#4a5568', lineHeight: '1.5' }}>
                18개 문항
              </p>
              <p style={{ fontSize: '0.75em', color: '#718096', marginTop: '4px' }}>
                [ 창업팀 ]
              </p>
            </button>

            {/* 심화 진단 */}
            <button
              onClick={() => navigate('/survey/advanced')}
              style={{
                flex: 1,
                maxWidth: '240px',
                padding: '32px 24px',
                background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
                border: '2px solid #9ae6b4',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h2 style={{ fontSize: '1.3em', fontWeight: '700', color: '#276749', marginBottom: '8px' }}>
                심화 진단
              </h2>
              <p style={{ fontSize: '0.85em', color: '#4a5568', lineHeight: '1.5' }}>
                29개 문항
              </p>
              <p style={{ fontSize: '0.75em', color: '#718096', marginTop: '4px' }}>
                [ 예비 ]
              </p>
            </button>
          </div>

          {/* 관리자 버튼 */}
          {auth.user?.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                marginTop: '24px',
                padding: '12px 32px',
                background: '#edf2f7',
                border: '1px solid #cbd5e0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9em',
                color: '#4a5568',
                fontWeight: '500'
              }}
            >
              관리자 페이지
            </button>
          )}
        </div>

        {/* 로그아웃 */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#a0aec0',
              fontSize: '0.85em'
            }}
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
