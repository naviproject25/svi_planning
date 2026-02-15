import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';

interface Survey {
  id: string;
  date: string;
  companyName: string;
  author: string;
  submittedAt: string;
  surveyType?: string; // 추가
}

export function AdminResults() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [surveyTypes, setSurveyTypes] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    loadSurveys();
  }, []);

  useEffect(() => {
    // 설문 타입별 필터링
    if (selectedType === '전체') {
      setFilteredSurveys(surveys);
    } else {
      setFilteredSurveys(surveys.filter(s => s.surveyType === selectedType));
    }
  }, [selectedType, surveys]);

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
      
      // 고유한 설문 타입 추출
      const types = Array.from(new Set(submittedSurveys.map((s: Survey) => s.surveyType || '미분류')));
      setSurveyTypes(types);
    } else {
      // 샘플 데이터 4개 생성
      const sampleSurveys = [
        {
          id: '1730000001',
          date: '2024-02-05',
          companyName: '협동조합소셜랩',
          author: '황유덕',
          surveyType: '기업 자가진단 (초기창업형)',
          submittedAt: new Date('2024-02-05T10:30:00').toISOString(),
          submitted: true,
          responses: {
            q1: 4, q2: 3, q3: 4, q4: 3, q5: 4,
            q6: 3, q7: 4, q8: 3, q9: 4, q10: 3,
            q11: 4, q12: 3, q13: 4, q14: 3, q15: 4,
            q16: 3, q17: 4, q18: 3, q19: 4, q20: 3
          }
        },
        {
          id: '1730000002',
          date: '2024-02-06',
          companyName: '스타트업테크',
          author: '김민수',
          surveyType: '기업 자가진단 (초기창업형)',
          submittedAt: new Date('2024-02-06T14:20:00').toISOString(),
          submitted: true,
          responses: {
            q1: 5, q2: 4, q3: 5, q4: 4, q5: 3,
            q6: 4, q7: 5, q8: 4, q9: 3, q10: 4,
            q11: 5, q12: 4, q13: 3, q14: 4, q15: 5,
            q16: 4, q17: 3, q18: 4, q19: 5, q20: 4
          }
        },
        {
          id: '1730000003',
          date: '2024-02-07',
          companyName: '이노베이션랩',
          author: '이지영',
          surveyType: '기업 자가진단 (초기창업형)',
          submittedAt: new Date('2024-02-07T09:15:00').toISOString(),
          submitted: true,
          responses: {
            q1: 3, q2: 4, q3: 3, q4: 4, q5: 5,
            q6: 4, q7: 3, q8: 4, q9: 5, q10: 4,
            q11: 3, q12: 4, q13: 5, q14: 4, q15: 3,
            q16: 4, q17: 5, q18: 4, q19: 3, q20: 4
          }
        },
        {
          id: '1730000004',
          date: '2024-02-08',
          companyName: '퓨처코리아',
          author: '박준호',
          surveyType: '기업 자가진단 (초기창업형)',
          submittedAt: new Date('2024-02-08T16:45:00').toISOString(),
          submitted: true,
          responses: {
            q1: 4, q2: 5, q3: 4, q4: 5, q5: 4,
            q6: 5, q7: 4, q8: 5, q9: 4, q10: 5,
            q11: 4, q12: 5, q13: 4, q14: 5, q15: 4,
            q16: 5, q17: 4, q18: 5, q19: 4, q20: 5
          }
        }
      ];
      
      localStorage.setItem('surveys', JSON.stringify(sampleSurveys));
      setSurveys(sampleSurveys);
      setSurveyTypes(['기업 자가진단 (초기창업형)']);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      const surveysData = localStorage.getItem('surveys');
      if (surveysData) {
        const parsedSurveys = JSON.parse(surveysData);
        const filtered = parsedSurveys.filter((s: Survey) => s.id !== deleteId);
        localStorage.setItem('surveys', JSON.stringify(filtered));
        loadSurveys();
      }
    }
    setDeleteId(null);
  };

  const handleDeleteAll = () => {
    setShowDeleteAllModal(true);
  };

  const handleConfirmDeleteAll = () => {
    localStorage.removeItem('surveys');
    loadSurveys();
    setShowDeleteAllModal(false);
  };

  const handleResetData = () => {
    // 로컬스토리지 완전 초기화 후 샘플 데이터 재생성
    localStorage.removeItem('surveys');
    
    const sampleSurveys = [
      {
        id: '1730000001',
        date: '2024-02-05',
        companyName: '협동조합소셜랩',
        author: '황유덕',
        surveyType: '기업 자가진단 (초기창업형)',
        submittedAt: new Date('2024-02-05T10:30:00').toISOString(),
        submitted: true,
        responses: {}
      },
      {
        id: '1730000002',
        date: '2024-02-06',
        companyName: '스타트업테크',
        author: '김민수',
        surveyType: '기업 자가진단 (초기창업형)',
        submittedAt: new Date('2024-02-06T14:20:00').toISOString(),
        submitted: true,
        responses: {}
      },
      {
        id: '1730000003',
        date: '2024-02-07',
        companyName: '이노베이션랩',
        author: '이지영',
        surveyType: '기업 자가진단 (초기창업형)',
        submittedAt: new Date('2024-02-07T09:15:00').toISOString(),
        submitted: true,
        responses: {}
      },
      {
        id: '1730000004',
        date: '2024-02-08',
        companyName: '퓨처코리아',
        author: '박준호',
        surveyType: '기업 자가진단 (초기창업형)',
        submittedAt: new Date('2024-02-08T16:45:00').toISOString(),
        submitted: true,
        responses: {}
      }
    ];
    
    localStorage.setItem('surveys', JSON.stringify(sampleSurveys));
    loadSurveys();
  };

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f5' }}>
      {/* 고정 로그아웃 버튼 */}
      <button
        onClick={() => {
          auth.signOut();
          navigate('/login');
        }}
        className="fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-110"
        style={{ 
          background: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
        title="로그아웃"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#718096" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#2d3748' }}>관리자 페이지</h1>
              <p className="text-sm" style={{ color: '#718096' }}>
                {selectedType === '전체' 
                  ? `전체 설문 목록 (${surveys.length}건)` 
                  : `${selectedType} (${filteredSurveys.length}건)`
                } • {auth.user?.name}님
              </p>
            </div>
            <div className="flex gap-3">
              {surveys.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="px-4 py-2 text-sm text-white rounded-md font-medium transition-all hover:opacity-80"
                  style={{ background: '#dc2626' }}
                >
                  전체 삭제
                </button>
              )}
            </div>
          </div>

          {/* 설문지 종류 필터 */}
          <div className="flex gap-3 items-center pt-4 border-t" style={{ borderColor: '#e2e8f0' }}>
            <label htmlFor="surveyTypeFilter" className="text-sm font-medium" style={{ color: '#4a5568' }}>
              설문지 종류:
            </label>
            <select
              id="surveyTypeFilter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 text-sm rounded-md font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                background: '#ffffff',
                border: '1px solid #cbd5e0',
                color: '#2d3748',
                minWidth: '200px'
              }}
            >
              <option value="전체">전체 ({surveys.length})</option>
              <option value="기업 자가진단 (초기창업형)">
                기업 자가진단 (초기창업형) ({surveys.filter(s => s.surveyType === '기업 자가진단 (초기창업형)').length})
              </option>
            </select>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-lg shadow-sm">
          {surveys.length === 0 ? (
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
                      설문지 종류
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
                        {survey.surveyType || '미분류'}
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

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#2d3748' }}>설문 삭제</h3>
              <p className="text-sm mb-6" style={{ color: '#718096' }}>이 설문을 삭제하시겠습니까?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-6 py-2 text-sm rounded-md font-medium transition-all hover:opacity-80"
                  style={{ 
                    background: '#e2e8f0',
                    color: '#4a5568'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 text-sm rounded-md font-medium transition-all hover:opacity-80"
                  style={{ 
                    background: '#dc2626',
                    color: 'white'
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete All Confirmation Modal */}
        {showDeleteAllModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#2d3748' }}>전체 설문 삭제</h3>
              <p className="text-sm mb-6" style={{ color: '#718096' }}>모든 설문을 삭제하시겠습니까?<br />이 작업은 취소할 수 없습니다.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteAllModal(false)}
                  className="px-6 py-2 text-sm rounded-md font-medium transition-all hover:opacity-80"
                  style={{ 
                    background: '#e2e8f0',
                    color: '#4a5568'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmDeleteAll}
                  className="px-6 py-2 text-sm rounded-md font-medium transition-all hover:opacity-80"
                  style={{ 
                    background: '#dc2626',
                    color: 'white'
                  }}
                >
                  전체 삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}