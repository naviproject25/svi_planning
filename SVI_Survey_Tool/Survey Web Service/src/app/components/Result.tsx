import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';
import { AlertCircle, CheckCircle, LogOut, ArrowLeft } from 'lucide-react';
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
import {
  calculateSVIScores,
  CATEGORIES,
  type SurveyType,
  type ScoringResult,
} from './scoringData';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const CATEGORY_COLORS: Record<string, string> = {
  '조직미션': '#3b82f6',
  '사업활동': '#f59e0b',
  '조직운영': '#10b981',
  '재정성과': '#8b5cf6',
  '기업혁신': '#6574cd',
};

export function Result() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [result, setResult] = useState<any>(null);
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
    if (survey.companyOpinion) setCompanyOpinion(survey.companyOpinion);
    if (survey.comprehensiveOpinion) setComprehensiveOpinion(survey.comprehensiveOpinion);
    setLoading(false);
  }, [surveyId]);

  useEffect(() => {
    if (!result) return;
    const surveysData = localStorage.getItem('surveys');
    if (surveysData) {
      const surveys = JSON.parse(surveysData);
      const survey = surveys.find((s: any) => s.id === surveyId);
      if (survey?.submitted) setIsSubmitted(true);
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
    const surveyPath = result?.surveyType === 'advanced-svi' ? '/survey/advanced' : '/survey/basic';
    navigate(`${surveyPath}?edit=${surveyId}`);
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

  const surveyType: SurveyType = result.surveyType === 'advanced-svi' ? 'advanced-svi' : 'basic-svi';
  const isBasic = surveyType === 'basic-svi';
  const scores: ScoringResult = calculateSVIScores(result.responses, surveyType);

  // 취약/강점 영역 (3개 관점 기준 - 엑셀 INDEX/MATCH와 동일: 동점 시 첫 번째 매칭)
  const minPerspScore = Math.min(...scores.perspectiveScores.map(p => p.score));
  const maxPerspScore = Math.max(...scores.perspectiveScores.map(p => p.score));
  const weakestPerspective = scores.perspectiveScores.find(p => p.score === minPerspScore)!;
  const strongestPerspective = scores.perspectiveScores.find(p => p.score === maxPerspScore)!;

  // 취약/강점 요인 (그래프 요인 점수 기준 - 엑셀 INDEX/MATCH와 동일: 동점 시 첫 번째 매칭)
  const minFactorScore = Math.min(...scores.graphFactorScores.map(f => f.score));
  const maxFactorScore = Math.max(...scores.graphFactorScores.map(f => f.score));
  const weakestFactor = scores.graphFactorScores.find(f => f.score === minFactorScore)!;
  const strongestFactor = scores.graphFactorScores.find(f => f.score === maxFactorScore)!;

  // Radar Chart 데이터
  const chartData = {
    labels: [...CATEGORIES],
    datasets: [{
      label: '진단 결과',
      data: CATEGORIES.map(cat => {
        const cs = scores.categoryScores.find(c => c.name === cat);
        return cs ? cs.score : 0;
      }),
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
      pointBorderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          display: true,
          backdropColor: 'transparent',
          color: '#64748b',
          font: { size: 12 },
        },
        grid: { color: '#e2e8f0', lineWidth: 1 },
        angleLines: { color: '#e2e8f0', lineWidth: 1 },
        pointLabels: {
          display: true,
          font: { size: 16, weight: 'bold' as const },
          color: '#1e293b',
          padding: 15,
        },
      },
    },
    plugins: {
      legend: { display: false },
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
          },
        },
      },
    },
  };

  // 상세 코멘트 섹션 데이터 (엑셀 결과보고서 B27-B56 / 심화진단 보고서 B27-B56 수식 그대로 적용)
  const detailSections = isBasic ? [
    {
      header: '[소셜미션· 사업계획수립]',
      factorNames: ['소셜미션', '성과관리체계'],
      connectors: ['', ' '],
    },
    {
      header: '[기업의 사회적가치·사회적경제기업협력·지역협력]',
      factorNames: ['기업의 사회적가치', '사회적가치(다중)', '사회적경제기업 협력', '지역협력'],
      connectors: ['', ' ', '. 또한, ', ' '],
    },
    {
      header: '[사회환원]',
      factorNames: ['사회환원'],
      connectors: [''],
    },
    {
      header: '[민주적 의사결정·고용·교육]',
      factorNames: ['조직 거버넌스', '고용', '내부역량향상'],
      connectors: ['', ' ', '. 그리고 '],
    },
    {
      header: '[비즈니스모델과]',
      factorNames: ['비즈니스모델', '경제적성과'],
      connectors: ['', ' '],
    },
    {
      header: '[성장잠재력·사업아이템·시장분석]',
      factorNames: ['성장잠재력', '사업아이템', '시장분석'],
      connectors: ['', ' ', ' '],
    },
  ] : [
    {
      header: '[소셜미션· 사업계획수립]',
      factorNames: ['소셜미션', '소셜미션실천', '성과관리', '사업계획수립'],
      connectors: ['', ' ', ' ', ' '],
    },
    {
      header: '[기업의 사회적가치·사회적경제기업협력·지역협력]',
      factorNames: ['근로자 보건 및 안전 운영', '사회적 가치 실천_근로자 권리', '사업의 사회적가치', '사회적경제기업 협력', '지역협력'],
      connectors: ['', ' ', '. 외부로는 ', '. 또한, ', ' '],
    },
    {
      header: '[사회환원]',
      factorNames: ['사회환원계획', '사회적이익'],
      connectors: ['', ' '],
    },
    {
      header: '[민주적 의사결정·고용·교육]',
      factorNames: ['민주적 의사결정 구조', '고용계획', '고용운영', '교육참여'],
      connectors: ['', ' ', '. 그리고 ', ' 교육으로 '],
    },
    {
      header: '[비즈니스모델]',
      factorNames: ['비즈니스모델', '마케팅 계획', '고정매출'],
      connectors: ['', ' ', ' 경제적성과는 '],
    },
    {
      header: '[성장잠재력·사업아이템·시장분석]',
      factorNames: ['성장잠재력', '아이템경쟁력', '혁신노력'],
      connectors: ['', ' ', ' '],
    },
  ];

  // 각 섹션의 요인 코멘트를 엑셀 수식대로 연결
  const detailTexts = detailSections.map(section => {
    const text = section.factorNames.map((name, i) => {
      const factor = scores.factorScores.find(f => f.name === name);
      return section.connectors[i] + (factor?.comment || '');
    }).join('');
    return { header: section.header, text };
  });

  return (
    <div className="min-h-screen print-root" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '40px 20px',
      position: 'relative',
    }}>
      {/* 상단 버튼 */}
      <div className="no-print" style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
        display: 'flex', gap: '12px',
      }}>
        {auth.user?.isAdmin && (
          <CircleButton onClick={() => navigate('/admin')}>
            <ArrowLeft size={20} />
          </CircleButton>
        )}
        <CircleButton onClick={() => { auth.signOut(); navigate('/login'); }}>
          <LogOut size={20} />
        </CircleButton>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm 15mm; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print, .no-print-input { display: none !important; }
          .print-root {
            background: white !important;
            padding: 0 !important;
            min-height: auto !important;
          }
          .report-container {
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .report-header {
            padding: 24px 32px !important;
            border-radius: 0 !important;
          }
          .report-header h1 { font-size: 24px !important; }
          .report-content { padding: 20px 24px !important; }
          .section-summary {
            padding: 20px !important;
            margin-bottom: 20px !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .section-diagnosis {
            break-before: page;
            page-break-before: always;
            break-inside: avoid;
            page-break-inside: avoid;
            padding: 20px !important;
            margin-bottom: 20px !important;
          }
          .section-diagnosis .diagnosis-grid {
            grid-template-columns: 38% 62% !important;
            gap: 16px !important;
          }
          .section-diagnosis .radar-wrapper {
            height: 260px !important;
          }
          .section-detail {
            break-before: page;
            page-break-before: always;
            padding: 20px !important;
            margin-bottom: 0 !important;
          }
          .section-detail .detail-grid {
            grid-template-columns: 50% 50% !important;
            gap: 16px !important;
          }
          .detail-category-card {
            padding: 10px 12px !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .section-opinions {
            break-before: page;
            page-break-before: always;
          }
          .score-badges-grid {
            gap: 6px !important;
          }
          .score-badges-grid > div {
            padding: 8px !important;
          }
          .bar-chart-item {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="report-container" style={{
        maxWidth: '210mm', margin: '0 auto', background: 'white',
        borderRadius: '16px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div className="report-header" style={{
          background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
          padding: '40px', color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4,
          }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
              입주기업 {isBasic ? '기초' : '심화'}진단 결과보고서
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.95, margin: 0, fontWeight: '500' }}>
              Light-SVI 진단도구 기반 종합 역량 분석
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="report-content" style={{ padding: '32px' }}>
          {/* Info Bar */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '12px 32px',
            padding: '20px 24px', background: '#f8fafc', borderRadius: '12px',
            border: '1px solid #e2e8f0', marginBottom: '32px', alignItems: 'center',
          }}>
            <InfoInline label="기업명" value={result.companyName} />
            <InfoInline label="담당자" value={result.author} />
            <InfoInline label="담임멘토" value={result.mentor || ''} />
            <InfoInline label="진단일" value={result.date} />
            {auth.user?.isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>면담일</span>
                <input type="date" className="no-print-input" style={{
                  border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '600', color: '#1e293b',
                }} />
              </div>
            )}
          </div>

          {/* 종합 분석 (Code 기반) */}
          <div className="section-summary" style={{
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            border: '2px solid #e0e7ff', borderRadius: '16px', padding: '32px',
            marginBottom: '32px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px',
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)', borderRadius: '50%',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' }}>
                종합 분석
              </h2>

              <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#334155', fontWeight: '500', marginBottom: '16px' }}>
                <strong style={{ color: '#667eea', fontSize: '18px' }}>{result.companyName}</strong> 기업을{' '}
                {isBasic ? '기초' : '심화'}진단한 결과 가장 취약한 영역은{' '}
                <strong style={{ color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>
                  {weakestPerspective.name}
                </strong>
                입니다.
              </div>

              {/* 엑셀 결과보고서 B9 수식 그대로 적용 */}
              <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#475569', marginBottom: '16px' }}>
                세부적으로 살펴보면 상대적으로 <strong>{weakestFactor.name}</strong> 요인이 낮습니다. 하지만{' '}
                <strong style={{ color: '#10b981' }}>{strongestFactor.name}</strong>은 긍정적으로 높게 나타났습니다.{' '}
                그리고{' '}
                <strong style={{ color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>
                  사업경험
                </strong>이{' '}
                {result.responses.businessExp === '있다' ? '있고' : '없고'}{' '}
                <strong style={{ color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>
                  동종업종
                </strong>{' '}
                경험은 {result.responses.industryExp === '있다' ? '있음' : '없음'}을 확인하였습니다.
              </div>
            </div>
          </div>

          {/* 진단 결과 (Radar + Score Badges) */}
          <div className="section-diagnosis" style={{
            background: 'white', borderRadius: '16px', padding: '28px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)', border: '1px solid #e2e8f0', marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 24px 0' }}>
              [진단]
            </h3>
            <div className="diagnosis-grid" style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '32px', alignItems: 'center' }}>
              <div className="radar-wrapper" style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Radar data={chartData} options={chartOptions} />
              </div>
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%)',
                  border: '2px solid #d97706', borderRadius: '12px', padding: '18px', marginBottom: '14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <AlertCircle size={20} color="#b45309" />
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#92400e', margin: 0 }}>
                      취약 영역: {weakestPerspective.name} ({weakestPerspective.score.toFixed(2)}점)
                    </h4>
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#78350f', margin: 0 }}>
                    {scores.codeComment}
                  </p>
                </div>

                <div className="score-badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {scores.categoryScores.map(cat => (
                    <ScoreBadge
                      key={cat.name}
                      label={cat.name}
                      value={cat.score.toFixed(2)}
                      color={CATEGORY_COLORS[cat.name] || '#3b82f6'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 상세 (Bar Chart + 범주별 코멘트) */}
          <div className="section-detail" style={{
            background: 'white', borderRadius: '16px', padding: '28px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)', border: '1px solid #e2e8f0', marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 24px 0' }}>
              [상세]
            </h3>
            <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: '32px' }}>
              {/* 엑셀 결과보고서 B27-B56 상세 섹션 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {detailTexts.map((section, idx) => (
                  <div key={idx} className="detail-category-card" style={{
                    background: '#f8fafc', borderRadius: '12px', padding: '16px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <h4 style={{
                      fontSize: '14px', fontWeight: '700', color: '#1e293b',
                      margin: '0 0 10px 0',
                    }}>
                      {section.header}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bar Chart */}
              <div style={{ paddingRight: '24px', paddingLeft: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: '#475569' }}>
                    <span><strong style={{ color: '#3b82f6' }}>우수</strong> 3.4 이상</span>
                    <span><strong style={{ color: '#d97706' }}>양호</strong> 1.7 ~ 3.4</span>
                    <span><strong style={{ color: '#dc2626' }}>개선</strong> 1.7 미만</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {scores.graphFactorScores.map((item, index) => {
                    const percentage = (item.score / 5) * 100;
                    let color: string;
                    if (item.score >= 3.4) color = '#3b82f6';
                    else if (item.score >= 1.7) color = '#d97706';
                    else color = '#dc2626';

                    return (
                      <div key={index} className="bar-chart-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{item.name}</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{item.score.toFixed(2)}</span>
                        </div>
                        <div style={{
                          width: '100%', height: '10px', background: '#f1f5f9',
                          borderRadius: '10px', overflow: 'hidden', position: 'relative',
                        }}>
                          <div style={{
                            height: '100%', width: `${percentage}%`,
                            background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
                            borderRadius: '10px', transition: 'width 0.4s ease',
                            boxShadow: `0 2px 4px ${color}40`,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Opinion Section */}
          {auth.user?.isAdmin && (
            <div className="section-opinions">
            <OpinionCards
              companyOpinion={companyOpinion}
              setCompanyOpinion={setCompanyOpinion}
              comprehensiveOpinion={comprehensiveOpinion}
              setComprehensiveOpinion={setComprehensiveOpinion}
            />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print" style={{
        maxWidth: '210mm', margin: '32px auto 0', display: 'flex',
        gap: '16px', justifyContent: 'center', paddingBottom: '40px',
      }}>
        {auth.user?.isAdmin ? (
          <>
            <ActionButton onClick={handleEdit} variant="secondary" label="수정" />
            <ActionButton onClick={() => window.print()} variant="primary" label="인쇄" />
            <ActionButton
              onClick={() => {
                if (!surveyId || !result) return;
                const surveysData = localStorage.getItem('surveys');
                if (surveysData) {
                  const surveys = JSON.parse(surveysData);
                  const updatedSurveys = surveys.map((s: any) =>
                    s.id === surveyId ? {
                      ...s,
                      saved: true,
                      savedAt: new Date().toISOString(),
                      companyOpinion,
                      comprehensiveOpinion,
                    } : s
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
            <ActionButton onClick={() => window.print()} variant="primary" label="인쇄" />
            <ActionButton
              onClick={() => !isSubmitted && setShowSubmitModal(true)}
              variant={isSubmitted ? 'disabled' : 'success'}
              label={isSubmitted ? '제출완료' : '제출'}
              disabled={isSubmitted}
            />
          </>
        )}
      </div>

      {showSubmitModal && (
        <SubmitModal onClose={() => setShowSubmitModal(false)} onConfirm={handleSubmit} />
      )}
    </div>
  );
}

// ===== Helper Components =====

function CircleButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'white', color: '#2d3748', border: '2px solid #e2e8f0',
        borderRadius: '50%', width: '48px', height: '48px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', transition: 'all 0.3s',
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
      {children}
    </button>
  );
}

function InfoInline({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '700' }}>{value}</span>
    </div>
  );
}

function ScoreBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: `${color}15`, border: `2px solid ${color}40`, borderRadius: '10px',
      padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{label}</span>
      <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>{value}</span>
    </div>
  );
}

function OpinionCards({
  companyOpinion, setCompanyOpinion, comprehensiveOpinion, setComprehensiveOpinion,
}: {
  companyOpinion: string; setCompanyOpinion: (v: string) => void;
  comprehensiveOpinion: string; setComprehensiveOpinion: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <OpinionCard
        title="기업 의견"
        subtitle="기업은 진단 결과를 확인하여 의견이 있을시 내용 기재"
        value={companyOpinion} onChange={setCompanyOpinion}
        placeholder="기업의견을 입력하세요..." color="#3b82f6"
      />
      <OpinionCard
        title="종합 의견"
        subtitle="기업의 진단 결과를 확인하여 면담 하여 담당자의 의견 서술"
        value={comprehensiveOpinion} onChange={setComprehensiveOpinion}
        placeholder="종합의견을 입력하세요..." color="#10b981"
      />
    </div>
  );
}

function OpinionCard({ title, subtitle, value, onChange, placeholder, color }: {
  title: string; subtitle: string; value: string; onChange: (v: string) => void;
  placeholder: string; color: string;
}) {
  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '28px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)', border: '1px solid #e2e8f0',
    }}>
      <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: '16px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{subtitle}</p>
      </div>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', minHeight: '140px', border: '2px solid #e2e8f0', borderRadius: '12px',
          padding: '16px', fontSize: '15px', lineHeight: '1.6', resize: 'vertical',
          boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s', color: '#334155',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 0 3px ${color}20`; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

function ActionButton({ onClick, variant, label, disabled }: {
  onClick: () => void; variant: 'primary' | 'secondary' | 'success' | 'disabled';
  label: string; disabled?: boolean;
}) {
  const styles: Record<string, any> = {
    primary: { background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', color: 'white', border: 'none' },
    secondary: { background: 'white', color: '#475569', border: '1.5px solid #cbd5e1' },
    success: { background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', color: 'white', border: 'none' },
    disabled: { background: '#cbd5e0', color: '#94a3b8', border: 'none', cursor: 'not-allowed', opacity: 0.7 },
  };
  const style = styles[variant];
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        ...style, padding: '16px 36px', fontSize: '16px', fontWeight: '700', borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s', minWidth: '140px',
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)'; } }}
      onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'; } }}
    >
      {label}
    </button>
  );
}

function SubmitModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white', padding: '40px', borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', maxWidth: '480px', width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '16px', borderRadius: '16px', display: 'flex',
          }}>
            <CheckCircle size={32} color="white" />
          </div>
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: '16px' }}>
          결과 제출 확인
        </h3>
        <p style={{ fontSize: '16px', color: '#64748b', lineHeight: 1.6, textAlign: 'center', marginBottom: '32px' }}>
          이 결과를 제출하시겠습니까?<br />제출 후에는 관리자가 확인할 수 있습니다.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: '#f1f5f9', color: '#475569', border: 'none',
              padding: '14px', fontSize: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white', border: 'none', padding: '14px', fontSize: '16px',
              borderRadius: '12px', cursor: 'pointer', fontWeight: '600',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)'; }}
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
}
