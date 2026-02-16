import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';
import { LogOut, Settings, Plus, X, Download } from 'lucide-react';
import {
  calculateSVIScores,
  CATEGORIES,
  BASIC_GRAPH_FACTORS,
  ADVANCED_GRAPH_FACTORS,
  type SurveyType,
} from './scoringData';
import * as XLSX from 'xlsx';

interface Survey {
  id: string;
  date: string;
  companyName: string;
  author: string;
  mentor?: string;
  submittedAt: string;
  surveyType?: string;
}

interface Mentor {
  name: string;
  category: '기초' | '심화' | '공통';
}

interface ApiSettings {
  provider: 'claude' | 'gemini';
  apiKey: string;
}

const DEFAULT_MENTORS: Mentor[] = [
  { name: '장덕수', category: '공통' },
  { name: '서일화', category: '공통' },
  { name: '이상기', category: '공통' },
  { name: '황유덕', category: '공통' },
];

export function AdminResults() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [newMentorName, setNewMentorName] = useState('');
  const [newMentorCategory, setNewMentorCategory] = useState<'기초' | '심화' | '공통'>('공통');
  const [apiSettings, setApiSettings] = useState<ApiSettings>({ provider: 'claude', apiKey: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    loadSurveys();
    // 멘토 로드
    const saved = localStorage.getItem('mentors');
    if (saved) {
      setMentors(JSON.parse(saved));
    } else {
      setMentors(DEFAULT_MENTORS);
      localStorage.setItem('mentors', JSON.stringify(DEFAULT_MENTORS));
    }
    // API 설정 로드
    const apiSaved = localStorage.getItem('apiSettings');
    if (apiSaved) {
      setApiSettings(JSON.parse(apiSaved));
    }
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
      const surveyTypeValue = survey.surveyType || 'basic-svi';
      if (surveyTypeValue !== filterType) return false;
    }
    
    // 검색어 필터 (기업명, 작성자)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const companyMatch = survey.companyName.toLowerCase().includes(query);
      const authorMatch = survey.author.toLowerCase().includes(query);
      const dateMatch = survey.date.includes(query);
      const mentorMatch = (survey.mentor || '').toLowerCase().includes(query);
      return companyMatch || authorMatch || dateMatch || mentorMatch;
    }
    
    return true;
  });

  const handleAddMentor = () => {
    const trimmed = newMentorName.trim();
    if (!trimmed) return;
    if (mentors.some(m => m.name === trimmed)) return;
    const updated = [...mentors, { name: trimmed, category: newMentorCategory }];
    setMentors(updated);
    localStorage.setItem('mentors', JSON.stringify(updated));
    setNewMentorName('');
  };

  const handleDeleteMentor = (name: string) => {
    const updated = mentors.filter(m => m.name !== name);
    setMentors(updated);
    localStorage.setItem('mentors', JSON.stringify(updated));
  };


  const handleExcelDownload = () => {
    const surveysData = localStorage.getItem('surveys');
    if (!surveysData) return;

    const allSurveys = JSON.parse(surveysData);
    const submittedSurveys = allSurveys.filter((s: any) => s.submitted === true);

    // 필터 적용
    const targetSurveys = submittedSurveys.filter((survey: any) => {
      if (filterType !== 'all') {
        const st = survey.surveyType || 'basic-svi';
        if (st !== filterType) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const companyMatch = (survey.companyName || '').toLowerCase().includes(query);
        const authorMatch = (survey.author || '').toLowerCase().includes(query);
        const dateMatch = (survey.date || '').includes(query);
        const mentorMatch = (survey.mentor || '').toLowerCase().includes(query);
        return companyMatch || authorMatch || dateMatch || mentorMatch;
      }
      return true;
    });

    if (targetSurveys.length === 0) return;

    // 그래프 요인명 수집
    const allGraphNames = new Set<string>();
    BASIC_GRAPH_FACTORS.forEach(g => allGraphNames.add(g.name));
    ADVANCED_GRAPH_FACTORS.forEach(g => allGraphNames.add(g.name));
    const graphNameList = Array.from(allGraphNames);

    // 헤더
    const headers = [
      '제출일시', '자가진단일', '기업명', '작성자', '담임멘토', '설문유형',
      ...CATEGORIES.map(c => `[범주] ${c}`),
      ...graphNameList.map(n => `[상세] ${n}`),
    ];

    // 데이터 행 생성
    const rows = targetSurveys.map((survey: any) => {
      const surveyType = (survey.surveyType || 'basic-svi') as SurveyType;
      const responses = survey.responses || {};
      const result = calculateSVIScores(responses, surveyType);

      const catScoreMap: Record<string, number> = {};
      result.categoryScores.forEach(c => { catScoreMap[c.name] = c.score; });

      const graphScoreMap: Record<string, number> = {};
      result.graphFactorScores.forEach(g => { graphScoreMap[g.name] = g.score; });

      return [
        new Date(survey.submittedAt).toLocaleString('ko-KR'),
        survey.date || '',
        survey.companyName || '',
        survey.author || '',
        survey.mentor || '',
        surveyType === 'advanced-svi' ? '심화 진단' : '기초 진단',
        ...CATEGORIES.map(c => catScoreMap[c] ?? ''),
        ...graphNameList.map(n => graphScoreMap[n] ?? ''),
      ];
    });

    // xlsx 워크북 생성
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 컬럼 너비 자동 조정
    ws['!cols'] = headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map((r: any[]) => String(r[i] ?? '').length));
      return { wch: Math.min(Math.max(maxLen + 2, 10), 30) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SVI 진단결과');
    XLSX.writeFile(wb, `SVI_진단결과_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const surveysData = localStorage.getItem('surveys');
    if (surveysData) {
      const parsedSurveys = JSON.parse(surveysData);
      const filtered = parsedSurveys.filter((s: Survey) => s.id !== deleteTarget);
      localStorage.setItem('surveys', JSON.stringify(filtered));
      loadSurveys();
    }
    setDeleteTarget(null);
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleExcelDownload}
                disabled={filteredSurveys.length === 0}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: '#edf2f7',
                  color: '#2f855a',
                  border: '1px solid #cbd5e0',
                }}
                onMouseEnter={(e) => {
                  if (filteredSurveys.length > 0) {
                    e.currentTarget.style.background = '#2f855a';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#2f855a';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#edf2f7';
                  e.currentTarget.style.color = '#2f855a';
                  e.currentTarget.style.borderColor = '#cbd5e0';
                }}
              >
                <Download size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                엑셀 다운로드
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all"
                style={{
                  background: showSettings ? '#4a5568' : '#edf2f7',
                  color: showSettings ? 'white' : '#4a5568',
                  border: '1px solid #cbd5e0'
                }}
              >
                <Settings size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                설정
              </button>
            </div>
          </div>

          {/* 설정 패널 */}
          {showSettings && (
            <div style={{ background: '#f7fafc', borderRadius: '8px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* 담임멘토 관리 */}
                <div>
                  <h3 className="text-sm font-bold mb-3" style={{ color: '#2d3748' }}>담임멘토 관리</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      value={newMentorName}
                      onChange={(e) => setNewMentorName(e.target.value)}
                      placeholder="멘토명"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMentor()}
                      className="px-3 py-1.5 border rounded text-sm"
                      style={{ borderColor: '#cbd5e0', flex: 1 }}
                    />
                    <select
                      value={newMentorCategory}
                      onChange={(e) => setNewMentorCategory(e.target.value as '기초' | '심화' | '공통')}
                      className="px-3 py-1.5 border rounded text-sm"
                      style={{ borderColor: '#cbd5e0' }}
                    >
                      <option value="공통">공통</option>
                      <option value="기초">기초</option>
                      <option value="심화">심화</option>
                    </select>
                    <button
                      onClick={handleAddMentor}
                      className="px-3 py-1.5 rounded text-sm text-white"
                      style={{ background: '#4a5568' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {mentors.map(m => (
                      <span key={m.name} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 10px', borderRadius: '16px', fontSize: '0.8em',
                        background: m.category === '공통' ? '#e2e8f0' : m.category === '기초' ? '#dbeafe' : '#d1fae5',
                        color: '#2d3748'
                      }}>
                        {m.name}
                        <span style={{ fontSize: '0.75em', color: '#718096' }}>({m.category})</span>
                        <button onClick={() => handleDeleteMentor(m.name)} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, lineHeight: 1 }}>
                          <X size={12} style={{ color: '#a0aec0' }} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* API 설정 */}
                <div>
                  <h3 className="text-sm font-bold mb-3" style={{ color: '#2d3748' }}>AI Provider 설정</h3>
                  <select
                    value={apiSettings.provider}
                    onChange={(e) => {
                      const updated = { ...apiSettings, provider: e.target.value as 'claude' | 'gemini' };
                      setApiSettings(updated);
                      localStorage.setItem('apiSettings', JSON.stringify(updated));
                    }}
                    className="px-3 py-1.5 border rounded text-sm"
                    style={{ borderColor: '#cbd5e0' }}
                  >
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="gemini">Gemini (Google)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
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
                <option value="basic-svi">기초 진단</option>
                <option value="advanced-svi">심화 진단</option>
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
                      담임멘토
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
                        {survey.mentor || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#2d3748' }}>
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{
                          background: survey.surveyType === 'advanced-svi' ? '#d1fae5' : '#dbeafe',
                          color: survey.surveyType === 'advanced-svi' ? '#065f46' : '#1e40af'
                        }}>
                          {survey.surveyType === 'advanced-svi' ? '심화 진단' : '기초 진단'}
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
                          onClick={() => setDeleteTarget(survey.id)}
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
      {/* 삭제 확인 다이얼로그 */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: '12px', padding: '32px',
              maxWidth: '400px', width: '90%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.1em', fontWeight: '700', color: '#2d3748', marginBottom: '8px' }}>
              설문 삭제
            </h3>
            <p style={{ fontSize: '0.9em', color: '#718096', marginBottom: '24px', lineHeight: '1.5' }}>
              이 설문을 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: '8px 20px', borderRadius: '8px', fontSize: '0.9em',
                  background: '#edf2f7', color: '#4a5568', border: 'none', cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 20px', borderRadius: '8px', fontSize: '0.9em',
                  background: '#e53e3e', color: 'white', border: 'none', cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}