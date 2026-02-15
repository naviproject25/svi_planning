import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

    // Load from localStorage
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

  // 제출 상태 확인
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
    
    // 제출 상태 초기화
    const surveysData = localStorage.getItem('surveys');
    if (surveysData) {
      const surveys = JSON.parse(surveysData);
      const updatedSurveys = surveys.map((s: any) => 
        s.id === surveyId ? { ...s, submitted: false, submittedAt: undefined } : s
      );
      localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
    }
    
    // 설문 수정 페이지로 이동
    navigate(`/survey?edit=${surveyId}`);
  };

  const calculateScores = (responses: Record<string, any>): { categories: CategoryScore; details: DetailScores } => {
    const scores = {
      categories: {} as CategoryScore,
      details: {} as DetailScores
    };

    // 상세 점수 계산
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

    // 카테고리 점수 계산 (5점 만점으로 환산)
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

    return scores;
  };

  const getWeakestCategory = (categories: CategoryScore) => {
    const items = [
      { name: '경영', value: categories.management, key: 'management' },
      { name: '재무', value: categories.finance, key: 'finance' },
      { name: '조직', value: categories.organization, key: 'organization' },
      { name: 'SVI', value: categories.svi, key: 'svi' }
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const reportPage = document.querySelector('.report-page') as HTMLElement;
    if (!reportPage) return;

    html2canvas(reportPage, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowHeight: reportPage.scrollHeight
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // 첫 페이지
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      // 나머지 페이지들
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('기초진단결과보고서.pdf');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
        <div className="text-lg">결과를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '결과를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  // Check if responses exist
  if (!result.responses) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f5' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">설문 응답 데이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const scores = calculateScores(result.responses);
  const weakestCategory = getWeakestCategory(scores.categories);

  const chartData = {
    labels: [
      scores.categories.management.toFixed(2),
      scores.categories.finance.toFixed(2),
      scores.categories.svi.toFixed(2),
      scores.categories.organization.toFixed(2)
    ],
    datasets: [
      {
        label: '진단 결과',
        data: [
          scores.categories.management,
          scores.categories.finance,
          scores.categories.svi,
          scores.categories.organization
        ],
        fill: false,
        backgroundColor: 'transparent',
        borderColor: '#333333',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#333333',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#333333',
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
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
          display: false
        },
        grid: {
          display: false
        },
        angleLines: {
          display: false
        },
        pointLabels: {
          display: true,
          font: {
            size: 18,
            weight: 'bold' as const
          },
          color: '#333',
          padding: -10
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
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
    <div className="min-h-screen" style={{ background: '#f5f5f5', padding: '20px' }}>
      {/* 고정 로그아웃 버튼 */}
      <button
        onClick={() => {
          auth.signOut();
          navigate('/login');
        }}
        className="fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-110 no-print"
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

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }
          body {
            background: white;
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
          .report-page {
            box-shadow: none;
            width: 100%;
            min-height: auto;
            max-height: 281mm;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
      
      <div className="report-page" style={{
        background: 'white',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: 0,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          background: '#4a5568',
          color: 'white',
          padding: '15px 30px',
          textAlign: 'center',
          fontSize: '1.5em',
          fontWeight: 'bold'
        }}>
          입주기업 기초진단 결과보고서
        </div>

        {/* Info Table */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <tbody>
            <tr>
              <td style={{
                background: '#6b7280',
                color: 'white',
                fontWeight: 'bold',
                width: '100px',
                textAlign: 'center',
                padding: '10px 15px',
                border: '1px solid #ddd'
              }}>기업명</td>
              <td style={{ padding: '10px 15px', border: '1px solid #ddd' }}>{result.companyName}</td>
              <td style={{
                background: '#6b7280',
                color: 'white',
                fontWeight: 'bold',
                width: '100px',
                textAlign: 'center',
                padding: '10px 15px',
                border: '1px solid #ddd'
              }}>담당</td>
              <td style={{ padding: '10px 15px', border: '1px solid #ddd' }}>{result.author}</td>
            </tr>
            <tr>
              <td style={{
                background: '#6b7280',
                color: 'white',
                fontWeight: 'bold',
                width: '100px',
                textAlign: 'center',
                padding: '10px 15px',
                border: '1px solid #ddd'
              }} colSpan={1}>자가진단일</td>
              <td style={{ padding: '10px 15px', border: '1px solid #ddd' }} colSpan={3}>{result.date}</td>
            </tr>
          </tbody>
        </table>

        {/* Summary Box */}
        <div style={{
          border: '3px solid #000',
          padding: '20px',
          margin: '20px'
        }}>
          <div style={{ fontSize: '1.1em', lineHeight: 1.8, marginBottom: '15px' }}>
            <strong>{result.companyName} 기업을 기초진단한 결과 가장 취약한 영역은 {weakestCategory.name}입니다</strong>
          </div>
          <div style={{ fontSize: '0.95em', lineHeight: 1.8, marginBottom: '15px' }}>
            세부적으로 살펴보면 상대적으로 {getWeakestDetail(scores.details)} 요인이 낮게 나타났으며, 이 영역에 대한 집중적인 개선과 보완이 필요한 상황입니다.
            {weakestCategory.name} 영역의 강화를 위해서는 체계적인 계획 수립과 실행 전략이 요구되며, 단계적 목표 설정을 통해 점진적으로 역량을 향상시켜 나가야 합니다.
            반면, {getStrongestDetail(scores.details)} 요인은 긍정적으로 높게 나타났으며, 이는 귀사의 강점 영역으로 지속적으로 유지·발전시켜 나갈 필요가 있습니다.
            이러한 강점을 기반으로 취약 영역을 보완하는 전략을 수립한다면 보다 균형있는 조직 발전을 이룰 수 있을 것입니다.
          </div>
          <div style={{ fontSize: '0.95em', lineHeight: 1.8 }}>
            또한 사업경험은 {result.responses.businessExp === '있다' ? '있는 것으로 확인되어, 기존의 사업 운영 노하우를 활용할 수 있는 기반이 마련되어 있습니다' : '없는 것으로 확인되어, 사업 운영에 대한 기초적인 이해와 학습이 필요할 것으로 보입니다'}.
            동종업종 경험은 {result.responses.industryExp === '있다' ? '있어, 업계에 대한 전문성과 네트워크를 보유하고 있어 사업 추진에 유리한 조건을 갖추고 있습니다' : '없어, 해당 업계에 대한 시장 조사와 전문성 확보를 위한 노력이 선행되어야 할 것으로 판단됩니다'}.
            이러한 경험적 배경을 고려하여 맞춤형 성장 전략을 수립하고, 필요한 역량을 보��해 나간다면 지속가능한 사회적기업으로 성장할 수 있을 것입니다.
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '50% 50%',
          gap: '20px',
          padding: '20px'
        }}>
          {/* Left Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Radar Chart */}
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '10px',
              border: '2px solid #dee2e6'
            }}>
              <div style={{
                fontSize: '1.3em',
                color: '#000',
                marginBottom: '10px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>영역진단결과</div>
              <div style={{
                position: 'relative',
                height: '320px',
                width: '320px',
                margin: '0 auto'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: '1fr 1fr',
                  zIndex: 0
                }}>
                  <div style={{
                    backgroundColor: 'rgba(219, 234, 254, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.3em', lineHeight: 1.3, color: '#1e40af' }}>경영</div>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(254, 243, 199, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.3em', lineHeight: 1.3, color: '#b45309', textAlign: 'right' }}>재무</div>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(236, 252, 203, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.3em', lineHeight: 1.3, color: '#4d7c0f' }}>조직</div>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(233, 213, 255, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.3em', lineHeight: 1.3, color: '#6d28d9', textAlign: 'right' }}>SVI</div>
                  </div>
                </div>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    width: '100%',
                    height: '1px',
                    background: 'rgba(0, 0, 0, 0.2)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    width: '1px',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.2)'
                  }} />
                </div>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 2
                }}>
                  <Radar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Detail Boxes */}
            <DetailBoxes />
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Diagnosis Box */}
            <DiagnosisBox weakestCategory={weakestCategory} />

            {/* Bar Chart */}
            <BarChartSection detailItems={detailItems} />
          </div>
        </div>

        {/* Opinion Section */}
        <OpinionSection 
          companyOpinion={companyOpinion}
          setCompanyOpinion={setCompanyOpinion}
          comprehensiveOpinion={comprehensiveOpinion}
          setComprehensiveOpinion={setComprehensiveOpinion}
        />

        {/* Footer */}
        <div style={{
          textAlign: 'right',
          padding: '20px',
          fontSize: '0.9em',
          color: '#666'
        }}>
          한국사회적기업진흥원 소셜캠퍼스온
        </div>
      </div>

      {/* Print Button */}
      <div className="no-print" style={{
        textAlign: 'center',
        background: 'white',
        padding: '30px',
        marginTop: '20px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        maxWidth: '210mm',
        margin: '20px auto'
      }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={handleEdit}
            style={{
              background: '#718096',
              color: 'white',
              border: '2px solid #718096',
              padding: '15px 40px',
              fontSize: '1.1em',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4a5568';
              e.currentTarget.style.borderColor = '#4a5568';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#718096';
              e.currentTarget.style.borderColor = '#718096';
            }}
          >
            수정
          </button>
          <button
            onClick={() => window.print()}
            style={{
              background: '#718096',
              color: 'white',
              border: '2px solid #718096',
              padding: '15px 50px',
              fontSize: '1.1em',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4a5568';
              e.currentTarget.style.borderColor = '#4a5568';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#718096';
              e.currentTarget.style.borderColor = '#718096';
            }}
          >
            인쇄
          </button>
          <button
            onClick={handleDownloadPDF}
            style={{
              background: '#718096',
              color: 'white',
              border: '2px solid #718096',
              padding: '15px 50px',
              fontSize: '1.1em',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4a5568';
              e.currentTarget.style.borderColor = '#4a5568';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#718096';
              e.currentTarget.style.borderColor = '#718096';
            }}
          >
            PDF
          </button>
          {auth.user?.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                background: 'white',
                color: '#2d3748',
                border: '2px solid #e2e8f0',
                padding: '15px 40px',
                fontSize: '1.1em',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f7fafc';
                e.currentTarget.style.borderColor = '#cbd5e0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              관리자
            </button>
          )}
          {!auth.user?.isAdmin && (
            <button
              onClick={() => !isSubmitted && setShowSubmitModal(true)}
              disabled={isSubmitted}
              style={{
                background: isSubmitted ? '#9ca3af' : '#1e3a8a',
                color: 'white',
                border: isSubmitted ? '2px solid #9ca3af' : '2px solid #1e3a8a',
                padding: '15px 40px',
                fontSize: '1.1em',
                borderRadius: '8px',
                cursor: isSubmitted ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s',
                opacity: isSubmitted ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitted) {
                  e.currentTarget.style.background = '#1a202c';
                  e.currentTarget.style.borderColor = '#1a202c';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitted) {
                  e.currentTarget.style.background = '#1e3a8a';
                  e.currentTarget.style.borderColor = '#1e3a8a';
                }
              }}
            >
              {isSubmitted ? '✓ 제출완료' : '제출'}
            </button>
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{
              fontSize: '1.5em',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#1e3a8a'
            }}>결과 제출 확인</div>
            <div style={{
              fontSize: '1.05em',
              color: '#4b5563',
              lineHeight: 1.6,
              marginBottom: '30px'
            }}>이 결과를 제출하시겠습니까?<br />제출 후에는 관리자가 확인할 수 있습니다.</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  padding: '12px 28px',
                  fontSize: '1em',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#e5e7eb';
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  background: '#1e3a8a',
                  color: 'white',
                  border: 'none',
                  padding: '12px 28px',
                  fontSize: '1em',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1e40af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1e3a8a';
                }}
              >
                제출
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function DetailBoxes() {
  const boxes = [
    {
      title: '[소셜미션· 사업계획수립]',
      content: '사회적문제 해결을 위한 계획과 목표달성을 위한 세부 전략을 마련하고 사업성과를 정기적으로 평가하며 피드백을 통해 계획을 보완하여야함'
    },
    {
      title: '[기업의 사회적가치·사회적경제기업협력·지역협력]',
      content: '업무재해 위험 요소를 파악하여 안전 교육을 실시하고 상품 가격 경쟁력을 유지하고 품질보장 방법을 모색해야함. 또한, 사회적경제기업과 협력사업을 확대하며 지속가능한 관계를 구축하고 지역기업과의 거래를 우선하여 지역경제 활성화에 기여해야함'
    },
    {
      title: '[사회환원]',
      content: '사회적환원 비율을 높이기위한 계획 수립과 실행을하고 정기적 사회서비스 제공 활동으로 지속적 지원체계를 구축해야함'
    },
    {
      title: '[민주적 의사결정·고용·교육]',
      content: '근로자들이 회의결과에 대해 의견을 제시할 수 있는 기회를 제공하고 고용 계획 수립과 인력확보 방안 모색이 필요함. 그리고 이슈현황을 문서화하여 체계적으로 관리하고 대표자가 교육내용을 기업에 적용할 수 있도록함'
    },
    {
      title: '[비즈니스모델]',
      content: '제품/서비스 프로타입 제작과 테스트를 실시하며 개선하고 지원사업 종료 후의 후속사업을 준비해야함'
    },
    {
      title: '[성장잠재력·사업아이템·시장분석]',
      content: '혁신적인 프로젝트를 통해 새로운 시장 진입을 적극적으로 시도하고 정기적으로 경쟁사 모니터링을 실시하여 시장 변화에 신속하게 대응하고 점검, 분석결과를 통해 대응방안을 마련한다'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {boxes.map((box, index) => (
        <div key={index} style={{
          border: '2px solid #000',
          padding: '15px',
          background: 'white'
        }}>
          <div style={{
            background: '#1e3a8a',
            color: 'white',
            padding: '8px 12px',
            margin: '-15px -15px 12px -15px',
            fontWeight: 'bold',
            fontSize: '0.95em'
          }}>{box.title}</div>
          <div style={{
            fontSize: '0.85em',
            lineHeight: 1.6,
            color: '#333'
          }}>{box.content}</div>
        </div>
      ))}
    </div>
  );
}

function DiagnosisBox({ weakestCategory }: { weakestCategory: { name: string; value: number } }) {
  const texts: Record<string, string> = {
    '경영': '경영 영역의 강화가 필요합니다. 사회적 가치 창출을 위한 명확한 소셜미션 수립이 우선되어야 하며, 이를 달성하기 위한 구체적이고 실행 가능한 사업계획을 마련해야 합니다. 사회적 문제 해결을 위한 목표를 설정하고, 단계별 실행 전략을 수립하여 정기적으로 성과를 평가하고 피드백을 반영하는 체계를 구축해야 합니다.',
    '재무': '재무 영역의 강화가 필요합니다. 지속가능한 비즈니스모델을 개발하고 고도화하여 안정적인 수익 구조를 확립해야 합니다. 재무 관리 체계를 강화하고 다각화된 수익원을 확보하여 재정적 안정성을 높이는 것이 중요합니다.',
    '조직': '조직 영역의 강화가 필요합니다. 민주적 의사결정 구조를 확립하여 구성원들의 참여와 의견 수렴이 실질적으로 이루어지도록 해야 합니다. 체계적인 고용 계획을 수립하여 일자리 창출과 고용 안정을 도모하고, 법정의무교육을 충실히 이행해야 합니다.',
    'SVI': 'SVI 영역의 강화가 필요합니다. 사회적 가치를 실현하는 구체적인 사업 활동을 확대해야 합니다. 사회적경제기업 간 협력 네트워크를 구축하여 상호 성장할 수 있는 기반을 마련하고, 지역사회와의 긴밀한 협력관계를 형성해야 합니다.'
  };

  return (
    <div style={{ border: '2px solid #1e3a8a', background: 'white' }}>
      <div style={{
        background: '#1e3a8a',
        color: 'white',
        padding: '12px 24px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span>진단결과</span>
      </div>
      <div style={{
        padding: '24px 28px',
        background: '#eff6ff',
        fontSize: '0.9em',
        lineHeight: 1.8
      }}>
        {texts[weakestCategory.name] || texts['경영']}
      </div>
    </div>
  );
}

function BarChartSection({ detailItems }: { detailItems: Array<{ label: string; value: number; originalMax: number }> }) {
  return (
    <div style={{ background: 'white' }}>
      <div style={{
        background: '#1e3a8a',
        color: 'white',
        padding: '12px 24px',
        fontWeight: 'bold'
      }}>상세진단결과</div>
      <div style={{ padding: '24px 32px' }}>
        {detailItems.map((item, index) => {
          const normalizedValue = (item.value / item.originalMax) * 5;
          const percentage = (normalizedValue / 5) * 100;
          let color;
          if (normalizedValue >= 3.5) {
            color = '#2563eb';
          } else if (normalizedValue >= 2) {
            color = '#f59e0b';
          } else {
            color = '#dc2626';
          }

          return (
            <div key={index} style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85em',
                marginBottom: '6px',
                color: '#333',
                paddingLeft: '2px',
                paddingRight: '2px'
              }}>
                <span>{item.label}</span>
                <span style={{ marginLeft: '16px' }}>{normalizedValue.toFixed(2)}</span>
              </div>
              <div style={{
                width: '100%',
                height: '24px',
                background: '#e5e7eb',
                borderRadius: '3px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  background: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.8em'
                }} />
              </div>
            </div>
          );
        })}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '10px',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9em',
            background: '#2563eb'
          }}>우수</div>
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9em',
            background: '#f59e0b'
          }}>양호</div>
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9em',
            background: '#dc2626'
          }}>위험</div>
        </div>
      </div>
    </div>
  );
}

function OpinionSection({
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
    <div style={{ margin: '20px' }}>
      <div style={{ marginBottom: '20px', border: '2px solid #1e3a8a' }}>
        <div style={{
          background: '#1e3a8a',
          color: 'white',
          padding: '10px 15px',
          fontWeight: 'bold',
          fontSize: '1em'
        }}>＜＜기업 의견＞＞</div>
        <div style={{ padding: '15px', background: 'white' }}>
          <span style={{
            fontSize: '0.85em',
            color: '#666',
            marginBottom: '5px',
            display: 'block'
          }}>기업은 진단 결과를 확인하여 의견이 있을시 내용 기재</span>
          <textarea
            value={companyOpinion}
            onChange={(e) => setCompanyOpinion(e.target.value)}
            placeholder="기업의견을 입력하세요..."
            style={{
              width: '100%',
              minHeight: '150px',
              border: '1px solid #ddd',
              padding: '10px',
              fontSize: '0.95em',
              lineHeight: 1.6,
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px', border: '2px solid #1e3a8a' }}>
        <div style={{
          background: '#1e3a8a',
          color: 'white',
          padding: '10px 15px',
          fontWeight: 'bold',
          fontSize: '1em'
        }}>＜＜종합 의견＞＞</div>
        <div style={{ padding: '15px', background: 'white' }}>
          <span style={{
            fontSize: '0.85em',
            color: '#666',
            marginBottom: '5px',
            display: 'block'
          }}>기업의 진단 결과를 확인하여 면담 하여 담당자의 의견 서술</span>
          <textarea
            value={comprehensiveOpinion}
            onChange={(e) => setComprehensiveOpinion(e.target.value)}
            placeholder="종합의견을 입력하세요..."
            style={{
              width: '100%',
              minHeight: '150px',
              border: '1px solid #ddd',
              padding: '10px',
              fontSize: '0.95em',
              lineHeight: 1.6,
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>
    </div>
  );
}