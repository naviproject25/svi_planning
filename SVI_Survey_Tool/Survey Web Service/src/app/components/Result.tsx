import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';
import { BarChart3, AlertCircle, CheckCircle, LogOut, ArrowLeft } from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ResultData {
  id: string;
  userId: string;
  date: string;
  companyName: string;
  author: string;
  mentor?: string;
  responses: Record<string, any>;
  categoryScores: Record<string, number>;
  summary: string;
  analyzedAt: string;
}

interface CategoryScore {
  management: number;
  finance: number;
  organization: number;
  svi: number;
  technology: number;
}

interface DetailScores {
  socialMission: number;
  businessPlan: number;
  workSafety: number;
  socialValue: number;
  socialCooperation: number;
  socialTrade: number;
  localNetwork: number;
  socialReturn: number;
  socialService: number;
  governance: number;
  employment: number;
  legalEducation: number;
  leaderEducation: number;
  businessModel: number;
  govSupport: number;
  innovation: number;
  marketAnalysis: number;
  marketMonitoring: number;
}

export function Result() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companyOpinion, setCompanyOpinion] = useState('');
  const [comprehensiveOpinion, setComprehensiveOpinion] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (!surveyId) {
      setError('잘못된 접근입니다.');
      setLoading(false);
      return;
    }

    const surveysData = localStorage.getItem('surveys');
    if (!surveysData) {
      setError('저장된 설문이 없습니다.');
      setLoading(false);
      return;
    }

    const surveys = JSON.parse(surveysData);
    const survey = surveys.find((s: any) => s.id === surveyId);
    
    if (!survey) {
      setError('설문을 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    setResult(survey);
    setLoading(false);
  }, [surveyId, navigate]);

  useEffect(() => {
    if (!result) return;
    
    const surveysData = localStorage.getItem('surveys');
    if (surveysData) {
      const surveys = JSON.parse(surveysData);
      const survey = surveys.find((s: any) => s.id === surveyId);
      if (survey && survey.submitted) {
        setIsSubmitted(true);
      }
    }
  }, [result, surveyId]);

  const handleSubmit = () => {
    if (!surveyId || !result) return;
    
    const surveysData = localStorage.getItem('surveys');
    if (surveysData) {
      const surveys = JSON.parse(surveysData);
      const updatedSurveys = surveys.map((s: any) => 
        s.id === surveyId ? { ...s, submitted: true, submittedAt: new Date().toISOString() } : s
      );
      localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
      setIsSubmitted(true);
      setShowSubmitModal(false);
    }
  };

  const handleEdit = () => {
    if (!surveyId) return;
    
    const surveysData = localStorage.getItem('surveys');
    if (surveysData) {
      const surveys = JSON.parse(surveysData);
      const updatedSurveys = surveys.map((s: any) => 
        s.id === surveyId ? { ...s, submitted: false, submittedAt: undefined } : s
      );
      localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
    }
    
    navigate(`/survey?edit=${surveyId}`);
  };

  const calculateScores = (responses: Record<string, any>): { categories: CategoryScore; details: DetailScores } => {
    const scores = {
      categories: {} as CategoryScore,
      details: {} as DetailScores
    };

    scores.details = {
      socialMission: responses.q1 || 0,
      businessPlan: responses.q2 || 0,
      workSafety: responses.q3 || 0,
      socialValue: Array.isArray(responses.q4) ? responses.q4.length : 0,
      socialCooperation: responses.q5 || 0,
      socialTrade: responses.q6 || 0,
      localNetwork: responses.q7 || 0,
      socialReturn: responses.q8 || 0,
      socialService: responses.q9 || 0,
      governance: responses.q10 || 0,
      employment: responses.q11 || 0,
      legalEducation: responses.q12 || 0,
      leaderEducation: responses.q13 || 0,
      businessModel: responses.q14 || 0,
      govSupport: responses.q15 || 0,
      innovation: responses.q16 || 0,
      marketAnalysis: responses.q17 || 0,
      marketMonitoring: responses.q18 || 0
    };

    const managementScores = [
      responses.q1 / 4 * 5,
      responses.q2 / 4 * 5,
      responses.q6 / 4 * 5,
      responses.q13 / 4 * 5,
      responses.q14 / 6 * 5,
      responses.q15 / 4 * 5,
      responses.q16 / 5 * 5,
      responses.q17 / 5 * 5,
      responses.q18 / 5 * 5
    ];
    scores.categories.management = managementScores.reduce((a, b) => a + b, 0) / managementScores.length;

    const financeScores = [
      responses.q8 / 4 * 5,
      responses.q15 / 4 * 5,
      responses.q16 / 5 * 5
    ];
    scores.categories.finance = financeScores.reduce((a, b) => a + b, 0) / financeScores.length;

    const orgScores = [
      responses.q3 / 4 * 5,
      responses.q10 / 5 * 5,
      responses.q11 / 6 * 5,
      responses.q12 / 4 * 5
    ];
    scores.categories.organization = orgScores.reduce((a, b) => a + b, 0) / orgScores.length;

    const sviScores = [
      responses.q1 / 4 * 5,
      responses.q3 / 4 * 5,
      (Array.isArray(responses.q4) ? responses.q4.length : 0) / 4 * 5,
      responses.q5 / 4 * 5,
      responses.q6 / 4 * 5,
      responses.q7 / 4 * 5,
      responses.q8 / 4 * 5,
      responses.q9 / 4 * 5,
      responses.q10 / 5 * 5,
      responses.q11 / 6 * 5
    ];
    scores.categories.svi = sviScores.reduce((a, b) => a + b, 0) / sviScores.length;

    const technologyScores = [
      responses.q14 / 6 * 5,
      responses.q16 / 5 * 5,
      responses.q17 / 5 * 5,
      responses.q18 / 5 * 5
    ];
    scores.categories.technology = technologyScores.reduce((a, b) => a + b, 0) / technologyScores.length;

    return scores;
  };

  const getWeakestCategory = (categories: CategoryScore) => {
    const items = [
      { name: '경영', value: categories.management, key: 'management' },
      { name: '재무', value: categories.finance, key: 'finance' },
      { name: '조직', value: categories.organization, key: 'organization' },
      { name: 'SVI', value: categories.svi, key: 'svi' },
      { name: '기술', value: categories.technology, key: 'technology' }
    ];
    items.sort((a, b) => a.value - b.value);
    return items[0];
  };

  const getWeakestDetail = (details: DetailScores) => {
    const items = Object.entries(details).map(([key, value]) => ({ key, value }));
    items.sort((a, b) => a.value - b.value);
    const weakest = items[0].key;
    const nameMap: Record<string, string> = {
      localNetwork: '지역협력',
      socialValue: '기업의 사회적가치',
      socialReturn: '사회환원',
      employment: '고용',
      businessModel: '비즈니스모델'
    };
    return nameMap[weakest] || weakest;
  };

  const getStrongestDetail = (details: DetailScores) => {
    const items = Object.entries(details).map(([key, value]) => ({ key, value }));
    items.sort((a, b) => b.value - a.value);
    const strongest = items[0].key;
    const nameMap: Record<string, string> = {
      businessPlan: '사업계획수립',
      socialMission: '소셜미션',
      governance: '민주적 의사결정',
      govSupport: '성장잠재력',
      innovation: '사업아이템'
    };
    return nameMap[strongest] || strongest;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-lg text-white">결과를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <p className="text-white mb-4 text-xl">{error || '결과를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  if (!result.responses) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <p className="text-white mb-4 text-xl">설문 응답 데이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const scores = calculateScores(result.responses);
  const weakestCategory = getWeakestCategory(scores.categories);

  const chartData = {
    labels: ['경영', '재무', 'SVI', '조직', '기술'],
    datasets: [
      {
        label: '진단 결과',
        data: [
          scores.categories.management,
          scores.categories.finance,
          scores.categories.svi,
          scores.categories.organization,
          scores.categories.technology
        ],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: false,
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          display: true,
          backdropColor: 'transparent',
          color: '#64748b',
          font: {
            size: 12
          }
        },
        grid: {
          color: '#e2e8f0',
          lineWidth: 1
        },
        angleLines: {
          color: '#e2e8f0',
          lineWidth: 1
        },
        pointLabels: {
          display: true,
          font: {
            size: 16,
            weight: 'bold' as const
          },
          color: '#1e293b',
          padding: 15
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3b82f6',
        borderWidth: 2,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return context.parsed.r.toFixed(2) + '점';
          }
        }
      }
    }
  };

  const detailItems = [
    { label: '소셜미션', value: scores.details.socialMission, originalMax: 4 },
    { label: '사업계획수립', value: scores.details.businessPlan, originalMax: 4 },
    { label: '기업의 사회적가치', value: scores.details.socialValue, originalMax: 4 },
    { label: '사회적경제기업 협력', value: scores.details.socialCooperation, originalMax: 4 },
    { label: '지역협력', value: scores.details.localNetwork, originalMax: 4 },
    { label: '사회환원계획', value: scores.details.socialReturn, originalMax: 4 },
    { label: '민주적 의사결정 구조', value: scores.details.governance, originalMax: 5 },
    { label: '고용계획', value: scores.details.employment, originalMax: 6 },
    { label: '내부역량향상', value: scores.details.leaderEducation, originalMax: 4 },
    { label: '비즈니스모델', value: scores.details.businessModel, originalMax: 6 },
    { label: '성장잠재력', value: scores.details.govSupport, originalMax: 4 },
    { label: '사업아이템', value: scores.details.innovation, originalMax: 5 },
    { label: '시장분석', value: scores.details.marketAnalysis, originalMax: 5 }
  ];

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '40px 20px',
      position: 'relative' 
    }}>
      {/* 로그아웃 버튼 */}
      <div className="no-print" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        gap: '12px'
      }}>
        {/* 뒤로가기 버튼 */}
        {auth.user?.isAdmin && (
          <button
            onClick={() => navigate('/admin')}
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
            <ArrowLeft size={20} />
          </button>
        )}
        
        {/* 로그아웃 버튼 */}
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

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            background: white !important;
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
          .report-container {
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .report-page {
            page-break-inside: avoid;
            box-shadow: none !important;
          }
        }
      `}</style>
      
      <div className="report-container" style={{
        maxWidth: '210mm',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden'
      }}>
        {/* Modern Header */}
        <div style={{
          background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
          padding: '40px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4
          }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700',
              margin: '0 0 16px 0',
              letterSpacing: '-0.5px'
            }}>
              입주기업 기초진단 결과보고서
            </h1>
            <p style={{ 
              fontSize: '16px', 
              opacity: 0.95,
              margin: 0,
              fontWeight: '500'
            }}>
              Light-SVI 진단도구 기반 종합 역량 분석
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div style={{ padding: '32px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 32px',
            padding: '20px 24px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '32px',
            alignItems: 'center'
          }}>
            <InfoInline label="기업명" value={result.companyName} />
            <InfoInline label="담당자" value={result.author} />
            <InfoInline label="멘토" value={result.mentor || ''} />
            <InfoInline label="진단일" value={result.date} />
            {auth.user?.isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>면담일</span>
                <input
                  type="date"
                  className="no-print-input"
                  style={{
                    border: '1px solid #e2e8f0',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    transition: 'all 0.2s'
                  }}
                />
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            border: '2px solid #e0e7ff',
            borderRadius: '16px',
            padding: '32px',
            marginTop: 0,
            marginRight: 0,
            marginBottom: '32px',
            marginLeft: 0,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 20px 0'
              }}>
                종합 분석
              </h2>
              
              <div style={{ 
                fontSize: '16px', 
                lineHeight: '1.8',
                color: '#334155',
                fontWeight: '500',
                marginBottom: '16px'
              }}>
                <strong style={{ color: '#667eea', fontSize: '18px' }}>
                  {result.companyName}
                </strong> 기업을 기초진단한 결과 가장 취약한 영역은{' '}
                <strong style={{ 
                  color: '#dc2626',
                  background: '#fee2e2',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {weakestCategory.name}
                </strong>입니다
              </div>
              
              <div style={{ 
                fontSize: '15px', 
                lineHeight: '1.8',
                color: '#475569',
                marginBottom: '16px'
              }}>
                세부적으로 살펴보면 상대적으로 <strong>{getWeakestDetail(scores.details)}</strong> 요인이 낮게 나타났으며, 
                이 영역에 대한 집중적인 개선과 보완이 필요한 상황입니다. {weakestCategory.name} 영역의 강화를 위해서는 
                체계적인 계획 수립과 실행 전략이 요구되며, 단계적 목표 설정을 통해 점진적으로 역량을 향상시켜 나가야 합니다.
              </div>
              
              <div style={{ 
                fontSize: '15px', 
                lineHeight: '1.8',
                color: '#475569',
                marginBottom: '16px'
              }}>
                반면, <strong style={{ color: '#10b981' }}>{getStrongestDetail(scores.details)}</strong> 요인은 긍정적으로 높게 나타났으며, 
                이는 귀사의 강점 영역으로 지속적으로 유지·발전시켜 나갈 필요가 있습니다. 
                이러한 강점을 기반으로 취약 영역을 보완하는 전략을 수립한다면 보다 균형있는 조직 발전을 이룰 수 있을 것입니다.
              </div>
              
              <div style={{ 
                fontSize: '15px', 
                lineHeight: '1.8',
                color: '#475569'
              }}>
                또한 사업경험은{' '}
                <strong style={{ 
                  color: result.responses.businessExp === '있다' ? '#10b981' : '#f59e0b'
                }}>
                  {result.responses.businessExp === '있다' ? '있는' : '없는'}
                </strong> 것으로 확인되어, 
                {result.responses.businessExp === '있다' 
                  ? ' 기존의 사업 운영 노하우를 활용할 수 있는 기반이 마련되어 있습니다' 
                  : ' 사업 운영에 대한 기초적인 이해와 학습이 필요할 것으로 보입니다'}.
                동종업종 경험은{' '}
                <strong style={{ 
                  color: result.responses.industryExp === '있다' ? '#10b981' : '#f59e0b'
                }}>
                  {result.responses.industryExp === '있다' ? '있어' : '없어'}
                </strong>
                {result.responses.industryExp === '있다'
                  ? ', 업계에 대한 전문성과 네트워크를 보유하고 있어 사업 추진에 유리한 조건을 갖추고 있습니다'
                  : ', 해당 업계에 대한 시장 조사와 전문성 확보를 위한 노력이 선행되어야 할 것으로 판단됩니다'}.
              </div>
            </div>
          </div>

          {/* Detailed Analysis Section */}
          <div style={{
            marginBottom: '32px'
          }}>
            {/* Combined Diagnosis Card - Radar Chart + Diagnosis Text */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 24px 0'
              }}>
                [진단]
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '40% 60%',
                gap: '32px',
                alignItems: 'center'
              }}>
                {/* Radar Chart */}
                <div style={{
                  height: '320px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Radar data={chartData} options={chartOptions} />
                </div>

                {/* Diagnosis Text */}
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '2px solid #fbbf24',
                    borderRadius: '12px',
                    padding: '18px',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px'
                    }}>
                      <AlertCircle size={20} color="#f59e0b" />
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#92400e',
                        margin: 0
                      }}>
                        취약 영역: {weakestCategory.name}
                      </h4>
                    </div>
                    <p style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: '#78350f',
                      margin: 0
                    }}>
                      {diagnosisTexts[weakestCategory.name]}
                    </p>
                  </div>

                  {/* Score Summary */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                  }}>
                    <ScoreBadge 
                      label="경영" 
                      value={scores.categories.management.toFixed(2)} 
                      color={iconColors['경영']} 
                    />
                    <ScoreBadge 
                      label="재무" 
                      value={scores.categories.finance.toFixed(2)} 
                      color={iconColors['재무']} 
                    />
                    <ScoreBadge 
                      label="조직" 
                      value={scores.categories.organization.toFixed(2)} 
                      color={iconColors['조직']} 
                    />
                    <ScoreBadge 
                      label="SVI" 
                      value={scores.categories.svi.toFixed(2)} 
                      color={iconColors['SVI']} 
                    />
                    <ScoreBadge 
                      label="기술" 
                      value={scores.categories.technology.toFixed(2)} 
                      color={iconColors['기술']} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Combined Detail Card */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 24px 0'
              }}>
                [상세]
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '55% 45%',
                gap: '32px'
              }}>
                {/* Recommendations Section */}
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      {
                        title: '소셜미션·사업계획수립',
                        items: ['계획수립과 세부 전략 마련', '성과가 및 피드백 체계']
                      },
                      {
                        title: '사회적가치·협력·지역',
                        items: ['안전교육 및 가격경쟁력', '사회적경제기업 협력 확대']
                      },
                      {
                        title: '사회환원',
                        items: ['사회환원 비율 증대', '정기적 서비스 제공']
                      },
                      {
                        title: '의사결정·고용·교육',
                        items: ['민주적 의견수렴', '고용계획 및 교육 적용']
                      },
                      {
                        title: '비즈니스모델',
                        items: ['프로토타입 제작', '개선작업 및 후속사업']
                      },
                      {
                        title: '성장·아이·시장',
                        items: ['혁신프로젝트 시도', '시장 모니터링']
                      }
                    ].map((rec, index) => (
                      <div key={index} style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s'
                      }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#1e293b',
                          margin: '0 0 10px 0'
                        }}>
                          {rec.title}
                        </h4>
                        <ul style={{
                          margin: 0,
                          paddingLeft: '20px',
                          fontSize: '13px',
                          color: '#64748b',
                          lineHeight: '1.6'
                        }}>
                          {rec.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bar Chart Section */}
                <div style={{
                  paddingRight: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <LegendBadge color="#3b82f6" label="우수" />
                      <LegendBadge color="#f59e0b" label="양호" />
                      <LegendBadge color="#dc2626" label="개선" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {detailItems.map((item, index) => {
                      const normalizedValue = (item.value / item.originalMax) * 5;
                      const percentage = (normalizedValue / 5) * 100;
                      let color;
                      if (normalizedValue >= 3.5) {
                        color = '#3b82f6';
                      } else if (normalizedValue >= 2) {
                        color = '#f59e0b';
                      } else {
                        color = '#dc2626';
                      }

                      return (
                        <div key={index}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '6px'
                          }}>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#334155'
                            }}>
                              {item.label}
                            </span>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '700',
                              color: color
                            }}>
                              {normalizedValue.toFixed(2)}
                            </span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '10px',
                            background: '#f1f5f9',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${percentage}%`,
                              background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
                              borderRadius: '10px',
                              transition: 'width 0.4s ease',
                              boxShadow: `0 2px 4px ${color}40`
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opinion Section */}
          {auth.user?.isAdmin && (
            <OpinionCards 
              companyOpinion={companyOpinion}
              setCompanyOpinion={setCompanyOpinion}
              comprehensiveOpinion={comprehensiveOpinion}
              setComprehensiveOpinion={setComprehensiveOpinion}
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print" style={{
        maxWidth: '210mm',
        margin: '32px auto 0',
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        paddingBottom: '40px'
      }}>
        {auth.user?.isAdmin ? (
          <>
            <ActionButton 
              onClick={handleEdit}
              variant="secondary"
              label="수정"
            />
            <ActionButton 
              onClick={() => window.print()}
              variant="primary"
              label="인쇄"
            />
            <ActionButton 
              onClick={() => {
                if (!surveyId || !result) return;
                const surveysData = localStorage.getItem('surveys');
                if (surveysData) {
                  const surveys = JSON.parse(surveysData);
                  const updatedSurveys = surveys.map((s: any) => 
                    s.id === surveyId ? { ...s, saved: true, savedAt: new Date().toISOString() } : s
                  );
                  localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
                  alert('저장되었습니다.');
                }
              }}
              variant="success"
              label="저장"
            />
          </>
        ) : (
          <>
            <ActionButton 
              onClick={() => window.print()}
              variant="primary"
              label="인쇄"
            />
            <ActionButton 
              onClick={() => !isSubmitted && setShowSubmitModal(true)}
              variant={isSubmitted ? 'disabled' : 'success'}
              label={isSubmitted ? '제출완료' : '제출'}
              disabled={isSubmitted}
            />
          </>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <SubmitModal 
          onClose={() => setShowSubmitModal(false)}
          onConfirm={handleSubmit}
        />
      )}
    </div>
  );
}

// Helper Components

function InfoInline({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '700' }}>{value}</span>
    </div>
  );
}

function InfoCard({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s'
    }}>
      <div style={{
        fontSize: '13px',
        color: '#64748b',
        fontWeight: '600',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {label}
      </div>
      {children || (
        <div style={{
          fontSize: '18px',
          color: '#1e293b',
          fontWeight: '700'
        }}>
          {value}
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: `${color}10`,
      border: `2px solid ${color}30`,
      borderRadius: '10px',
      padding: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span style={{ 
        fontSize: '14px', 
        fontWeight: '700',
        color: color
      }}>
        {label}
      </span>
      <span style={{ 
        fontSize: '18px', 
        fontWeight: '800',
        color: color
      }}>
        {value}
      </span>
    </div>
  );
}

function LegendBadge({ color, label }: { color: string; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '3px',
        background: color
      }} />
      <span style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b'
      }}>
        {label}
      </span>
    </div>
  );
}

function OpinionCards({
  companyOpinion,
  setCompanyOpinion,
  comprehensiveOpinion,
  setComprehensiveOpinion
}: {
  companyOpinion: string;
  setCompanyOpinion: (value: string) => void;
  comprehensiveOpinion: string;
  setComprehensiveOpinion: (value: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <OpinionCard 
        title="기업 의견"
        subtitle="기업은 진단 결과를 확인하여 의견이 있을시 내용 기재"
        value={companyOpinion}
        onChange={setCompanyOpinion}
        placeholder="기업의견을 입력하세요..."
        color="#3b82f6"
      />
      <OpinionCard 
        title="종합 의견"
        subtitle="기업의 진단 결과를 확인하여 면담 하여 담당자의 의견 서술"
        value={comprehensiveOpinion}
        onChange={setComprehensiveOpinion}
        placeholder="종합의견을 입력하세요..."
        color="#10b981"
      />
    </div>
  );
}

function OpinionCard({ 
  title, 
  subtitle, 
  value, 
  onChange, 
  placeholder,
  color 
}: { 
  title: string; 
  subtitle: string; 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
  color: string;
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        borderLeft: `4px solid ${color}`,
        paddingLeft: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: 0
        }}>
          {subtitle}
        </p>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: '140px',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '15px',
          lineHeight: '1.6',
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
          color: '#334155'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${color}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

function ActionButton({ 
  onClick, 
  variant, 
  label,
  disabled 
}: { 
  onClick: () => void; 
  variant: 'primary' | 'secondary' | 'success' | 'disabled'; 
  label: string;
  disabled?: boolean;
}) {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
      color: 'white',
      border: 'none'
    },
    secondary: {
      background: 'white',
      color: '#475569',
      border: '1.5px solid #cbd5e1'
    },
    success: {
      background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      color: 'white',
      border: 'none'
    },
    disabled: {
      background: '#cbd5e0',
      color: '#94a3b8',
      border: 'none',
      cursor: 'not-allowed',
      opacity: 0.7
    }
  };

  const style = styles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...style,
        padding: '16px 36px',
        fontSize: '16px',
        fontWeight: '700',
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s',
        minWidth: '140px'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      {label}
    </button>
  );
}

function SubmitModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '480px',
          width: '90%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '16px',
            borderRadius: '16px',
            display: 'flex'
          }}>
            <CheckCircle size={32} color="white" />
          </div>
        </div>

        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1e293b',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          결과 제출 확인
        </h3>
        
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          lineHeight: 1.6,
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          이 결과를 제출하시겠습니까?<br />
          제출 후에는 관리자가 확인할 수 있습니다.
        </p>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: '#f1f5f9',
              color: '#475569',
              border: 'none',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
            }}
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
}

// Diagnosis Texts
const diagnosisTexts: Record<string, string> = {
  '경영': '경영 영역의 강화가 필요합니다. 사회적 가치 창출을 위한 명확한 소셜미션 수립이 우선되어야 하며, 이를 달성하기 위한 구체적이고 실행 가능한 사업계획을 마련해야 합니다. 사회적 문제 해결을 위한 목표를 설정하고, 단계별 실행 전략을 수립하여 정기적으로 성과를 평가하고 피드백을 반영하는 체계를 구축해야 합니다.',
  '재무': '재무 영역의 강화가 필요합니다. 지속가능한 비즈니스모델을 개발하고 고도화하여 안정적인 수익 구조를 확립해야 합니다. 재무 관리 체계를 강화하고 다각화된 수익원을 확보하여 재정적 안정성을 높이는 것이 중요합니다.',
  '조직': '조직 영역의 강화가 필요합니다. 민주적 의사결정 구조를 확립하여 구성원들의 참여와 의견 수렴이 실질적으로 이루어지도록 해야 합니다. 체계적인 고용 계획을 수하여 일자리 창출과 고용 안정을 도모하고, 법정의무교육을 충실히 이행해야 합니다.',
  'SVI': 'SVI 영역의 강화가 필요합니다. 사회적 가치를 실현하는 구체적인 사업 활동을 확대해야 합니다. 사회적경제기업 간 협력 네트워크를 구축하여 상호 성장할 수 있는 기반을 마련하고, 지역사회와의 긴밀한 협력관계를 형성해야 합니다.',
  '기술': '기술 영역의 강화가 필요합니다. 혁신적인 기술 개발과 적용을 통해 경쟁력을 높여야 합니다. 기술적 지식과 능력을 향상시키기 위한 교육과 훈련을 실시하고, 최신 기술 동향을 파악하여 사업 전략에 반영해야 합니다.'
};

// Icon Colors
const iconColors: Record<string, string> = {
  '경영': '#3b82f6',
  '재무': '#f59e0b',
  '조직': '#10b981',
  'SVI': '#8b5cf6',
  '기술': '#6574cd'
};