import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';
import { LogOut } from 'lucide-react';

interface Survey {
  id: string;
  date: string;
  companyName: string;
  author: string;
  submittedAt: string;
  surveyType?: string;
}

export function AdminResults() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = () => {
    const surveysData = localStorage.getItem('surveys');
    if (surveysData) {
      const parsedSurveys = JSON.parse(surveysData);
      // 제출된 설문만 필터링
      const submittedSurveys = parsedSurveys.filter((s: Survey & { submitted?: boolean }) => s.submitted === true);
      // Sort by submission date, newest first
      submittedSurveys.sort((a: Survey, b: Survey) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setSurveys(submittedSurveys);
    }
  };

  // 필터링된 설문 목록
  const filteredSurveys = surveys.filter(survey => {
    // 설문 유형 필터
    if (filterType !== 'all') {
      const surveyTypeValue = survey.surveyType || 'light-svi';
      if (surveyTypeValue !== filterType) return false;
    }
    
    // 검색어 필터 (기업명, 작성자)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const companyMatch = survey.companyName.toLowerCase().includes(query);
      const authorMatch = survey.author.toLowerCase().includes(query);
      const dateMatch = survey.date.includes(query);
      return companyMatch || authorMatch || dateMatch;
    }
    
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm('이 설문을 삭제하시겠습니까?')) {
      const surveysData = localStorage.getItem('surveys');
      if (surveysData) {
        const parsedSurveys = JSON.parse(surveysData);
        const filtered = parsedSurveys.filter((s: Survey) => s.id !== id);
        localStorage.setItem('surveys', JSON.stringify(filtered));
        loadSurveys();
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f5' }}>
      {/* 로그아웃 버튼 - 우측 상단 고정 플로팅 */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000
      }}>
        <button
          onClick={() => {
            auth.signOut();
            navigate('/login');
          }}
          style={{
            background: 'white',
            color: '#2d3748',
            border: '2px solid #e2e8f0',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#2d3748' }}>관리자 페이지</h1>
              <p className="text-sm" style={{ color: '#718096' }}>전체 설문 목록 ({surveys.length}건) • {auth.user?.name}님</p>
            </div>
          </div>
          
          {/* 필터 콤보박스 */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* 검색 입력 */}
            <div className="flex items-center gap-2 flex-1" style={{ minWidth: '300px' }}>
              <label className="text-sm font-medium" style={{ color: '#4a5568' }}>
                검색:
              </label>
              <input
                type="text"
                placeholder="기업명, 작성자, 날짜로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-md text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  borderColor: '#cbd5e0',
                  color: '#2d3748',
                  background: 'white'
                }}
              />
            </div>
            
            {/* 설문 유형 필터 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium" style={{ color: '#4a5568' }}>
                설문 유형:
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-md text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  borderColor: '#cbd5e0',
                  color: '#2d3748',
                  background: 'white'
                }}
              >
                <option value="all">전체 보기</option>
                <option value="light-svi">Light-SVI (초기응답형)</option>
                <option value="standard-svi">Standard-SVI (일반형)</option>
                <option value="advanced-svi">Advanced-SVI (심화형)</option>
              </select>
            </div>
            
            <span className="text-sm" style={{ color: '#718096' }}>
              ({filteredSurveys.length}건)
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredSurveys.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg" style={{ color: '#718096' }}>
                아직 제출된 설문이 없습니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: '#f7fafc' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#4a5568' }}>
                      제출일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#4a5568' }}>
                      자가진단일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#4a5568' }}>
                      기업명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#4a5568' }}>
                      작성자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#4a5568' }}>
                      설문 유형
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#4a5568' }}>
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody style={{ background: 'white' }}>
                  {filteredSurveys.map((survey, index) => (
                    <tr 
                      key={survey.id}
                      className="border-b transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#e2e8f0' }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#2d3748' }}>
                        {new Date(survey.submittedAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#2d3748' }}>
                        {survey.date}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: '#2d3748' }}>
                        {survey.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#2d3748' }}>
                        {survey.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#2d3748' }}>
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{
                          background: survey.surveyType === 'light-svi' || !survey.surveyType ? '#dbeafe' : 
                                     survey.surveyType === 'standard-svi' ? '#fef3c7' : '#d1fae5',
                          color: survey.surveyType === 'light-svi' || !survey.surveyType ? '#1e40af' : 
                                 survey.surveyType === 'standard-svi' ? '#92400e' : '#065f46'
                        }}>
                          {survey.surveyType === 'light-svi' || !survey.surveyType ? 'Light-SVI' : 
                           survey.surveyType === 'standard-svi' ? 'Standard-SVI' : 'Advanced-SVI'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/result/${survey.id}`)}
                          className="px-3 py-1 text-sm rounded mr-2 transition-all hover:opacity-80"
                          style={{ 
                            background: '#3182ce',
                            color: 'white'
                          }}
                        >
                          보기
                        </button>
                        <button
                          onClick={() => handleDelete(survey.id)}
                          className="px-3 py-1 text-sm rounded transition-all hover:opacity-80"
                          style={{ 
                            background: '#e53e3e',
                            color: 'white'
                          }}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}