import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { LogOut } from 'lucide-react';

interface SurveyQuestion {
  id: string;
  type: 'radio' | 'checkbox' | 'binary' | 'scale';
  question: string;
  options?: { value: string | number; label: string }[];
  maxValue?: number;
}

const surveyQuestions: SurveyQuestion[] = [
  // 기본 정보
  {
    id: 'businessExp',
    type: 'binary',
    question: '과거에 사업경험이 있다',
    options: [
      { value: '있다', label: '있다' },
      { value: '없다', label: '없다' }
    ]
  },
  {
    id: 'industryExp',
    type: 'binary',
    question: '해당 업계에 종사한 경험이 있다',
    options: [
      { value: '있다', label: '있다' },
      { value: '없다', label: '없다' }
    ]
  },
  // Q1
  {
    id: 'q1',
    type: 'radio',
    question: '해결하고자 하는 사회적문제에 대한 해결방안 계획에 대한 질문입니다',
    options: [
      { value: 1, label: '1. 해결하고자 하는 사회적 문제가 있지만 아직 명확하지 않다' },
      { value: 2, label: '2. 해결하고자 하는 사회적 문제가 분명하지만 아직 구체적인 해결 계획은 없다' },
      { value: 3, label: '3. 해결하고자 하는 사회적 문제가 분명하고 구체적인 해결 계획을 가지고 있다' },
      { value: 4, label: '4. 해결하고자 하는 사회적 문제가 분명하고 계획이 구체적이며, 이에 따른 여러가지 시도를 해봤다' }
    ],
    maxValue: 4
  },
  // Q2
  {
    id: 'q2',
    type: 'radio',
    question: '사업계획에 대한 질문입니다',
    options: [
      { value: 1, label: '1. 연초에 사업계획을 세운다' },
      { value: 2, label: '2. 연초에 사업계획을 세우고, 문서화한다' },
      { value: 3, label: '3. 연초에 사업계획을 세우고, 문서화하여 기업 구성원(팀원, 직원 등)과 공유한다' },
      { value: 4, label: '4. 연초 사업계획을 세우고, 문서화하여 기업 구성원과 공유하며, 경제적, 사회적 성과지표가 명확하다' }
    ],
    maxValue: 4
  },
  // Q3
  {
    id: 'q3',
    type: 'radio',
    question: '근로자들의 보건 및 안전에 대한 관한 질문입니다',
    options: [
      { value: 1, label: '1. 업무 수행상 발생가능한 재해(사고, 질병)의 종류와 위치, 상황 등을 거의 확인하지 않고 있다' },
      { value: 2, label: '2. 업무 수행상 발생가능한 재해(사고, 질병)의 종류와 위치, 상황 등을 확인하고 있긴 하나 구체적으로 대비고 있지 않다' },
      { value: 3, label: '3. 업무 수행상 발생가능한 재해(사고, 질병)의 종류와 위치, 상황 등을 확인하고 있으며, 산업안전보건교육을 포함해 일부를 지원하고 있다' },
      { value: 4, label: '4. 업무 수행상 발생가능한 재해(사고, 질병)의 종류와 위치, 상황 등을 대비하고 있으며, 산업안전보건교육을 포함해 대부분을 지원하고 있다' }
    ],
    maxValue: 4
  },
  // Q4
  {
    id: 'q4',
    type: 'checkbox',
    question: '사업의 사회적가치에 관한 질문입니다. 해당사항을 모두 선택해주세요.',
    options: [
      { value: 1, label: '1. 시장에서 목표대상고객(지역)에게 잘 공급되지 않는 제품과 서비스를 공급하고 있다' },
      { value: 2, label: '2. 목표대상고객에게 시장 평균보다 저렴한 가격으로 제품과 서비스를 공급하고 있다' },
      { value: 3, label: '3. 제품과 서비스를 생산하고 판매하기 위해 취약계층을 고용하고 있다' },
      { value: 4, label: '4. 제품과 서비스를 생산하고 판매하는 데 있어서 지역의 자원을 주로 활용하고 있다' }
    ],
    maxValue: 4
  },
  // Q5
  {
    id: 'q5',
    type: 'radio',
    question: '사회적경제기업과 협력활동에 관한 질문입니다',
    options: [
      { value: 1, label: '1. 사회적경제기업 당사자 모임(협의회)이 있는지 모른다' },
      { value: 2, label: '2. 사회적경제기업 당사자 모임(협의회)이 있는지는 알고 있으나 활동하진 않는다' },
      { value: 3, label: '3. 사회적경제기업 당사자 모임(협의회)의 회원이며 회의에 참석한다' },
      { value: 4, label: '4. 사회적경제기업 당사자 모임(협의회)의 회원으로 기업들 간 봉사활동, 공동사업, 마켓운영 등 협력사업을 연 1회 이상 진행한다' }
    ],
    maxValue: 4
  },
  // Q6
  {
    id: 'q6',
    type: 'radio',
    question: '사회적경제기업과 거래활동에 관한 질문입니다',
    options: [
      { value: 1, label: '1. 우리 회사와 사업상 거래를 할 수 있는 사회적경제기업을 모른다' },
      { value: 2, label: '2. 우리 회사와 사업상 거래를 할 수 있는 사회적경제기업을 알고 있으나 거래를 하지는 않았다' },
      { value: 3, label: '3. 사회적경제기업과 협력을 강화하기 위해 상호거래 및 업무협약 등 최근 1년 이내 실행한 사례가 있다' },
      { value: 4, label: '4. 사회적경제기업과 협력을 강화하기 위해 상호거래 및 업무협약 등 최근 1년 이내 다수 진행하였다' }
    ],
    maxValue: 4
  },
  // Q7
  {
    id: 'q7',
    type: 'radio',
    question: '지역 네트워크활동에 관한 질문입니다',
    options: [
      { value: 1, label: '1. 거래에 있어 지역을 크게 신경쓰지 않는 편이다' },
      { value: 2, label: '2. 우리 지역 기업/기관과 거래하기 위해 탐색한 적은 있지만 아직 거래한 적이 없다' },
      { value: 3, label: '3. 우리 지역 기업/기관과 거래하기 위해 탐색하고 거래를 하였다' },
      { value: 4, label: '4. 타 지역 대비 우리 지역의 기업/기관과 거래를 많이 하는 편이다' }
    ],
    maxValue: 4
  },
  // Q8
  {
    id: 'q8',
    type: 'radio',
    question: '사업이익의 사회적환원에 관한 질문입니다',
    options: [
      { value: 1, label: '1. 사회적기업은 사업이익의 2/3 이상을 사회적 목적으로 환원하는 것에 대해 모른다' },
      { value: 2, label: '2. 사업이익의 2/3 이상을 사회적 목적으로 환원하는 것에 동의하지 않는다' },
      { value: 3, label: '3. 사업이익의 2/3 이상을 사회적 목적으로 환원하는 것에 동의하며 실행하고 있지만 아직 2/3이 되지 않는다.' },
      { value: 4, label: '4. 사업이익의 2/3 이상을 사회적 목적으로 환원하고 있다' }
    ],
    maxValue: 4
  },
  // Q9
  {
    id: 'q9',
    type: 'radio',
    question: '기업의 사회서비스 제공에 대한 질문입니다 (봉사활동 제외)',
    options: [
      { value: 1, label: '1. 지역사회 혹은 취약계층를 위해 사회서비스 제공을 하기엔 아직 여력이 없거나 자사의 사업특성상 할 수 있는 일이 없다' },
      { value: 2, label: '2. 지역사회 혹은 취약계층를 위해 사회서비스 제공 활동을 계획하고 있다' },
      { value: 3, label: '3. 지역사회 혹은 취약계층를 위해 사회서비스 제공 활동을 비정기적으로 수행하고 있다' },
      { value: 4, label: '4. 지역사회 혹은 취약계층를 위해 사회서비스 제공 활동을 정기적으로 수행하고 있다' }
    ],
    maxValue: 4
  },
  // Q10
  {
    id: 'q10',
    type: 'radio',
    question: '기업의 주요의사결정기구에 대한 질문입니다',
    options: [
      { value: 1, label: '1. 주요의사결정기구로 이사회 또는 운영위원회(사회적협동조합,비영리 등)가 아직 구성되어있지 않고 계획(진행)중이다' },
      { value: 2, label: '2. 주요의사결정기구로 이사회 또는 운영위원회(사회적협동조합,비영리 등)가 구성되어있다' },
      { value: 3, label: '3. 주요의사결정기구를 연 1회 비정기적으로 운영하였다' },
      { value: 4, label: '4. 주요의사결정기구를 연 2회 이상 운영하며 사외이사나 근로자대표가 참여한다' },
      { value: 5, label: '5. 주요의사결정기구에 연 2회 이상 운영하며 사외이사와 근로자대표가 참여하고 근로자에게 회의결과를 공유한다' }
    ],
    maxValue: 5
  },
  // Q11
  {
    id: 'q11',
    type: 'radio',
    question: '고용계획에 관한 질문입니다 (※유급근로자란 4대보험 가입 기준 고용인)',
    options: [
      { value: 1, label: '1. 현재 유급근로자가 없으며, 향후 6개월 내 고용 계획이 없다' },
      { value: 2, label: '2. 현재 유급근로자가 없으나, 향후 6개월 내 고용 계획이 있다' },
      { value: 3, label: '3. 최근 6개월 간 유급근로자가 1명 이상 있으며, 향후 6개월 내 고용 계획이 없다 (예비 충족 수준)' },
      { value: 4, label: '4. 최근 6개월 간 유급근로자가 1명 이상 있으며, 향후 6개월 내 고용 계획이 있다 (인증 충족 수준)' },
      { value: 5, label: '5. 최근 6개월 간 유급근로자가 3명 이상 있으나, 6개월 평균3명 미만이다' },
      { value: 6, label: '6. 최근 6개월 간 유급근로자가 3명 이상 있으며, 6개월 평균 3명 이상이다 (인증,일자리제공형 충족 수준)' }
    ],
    maxValue: 6
  },
  // Q12
  {
    id: 'q12',
    type: 'radio',
    question: '법정의무교육에 관한 질문입니다',
    options: [
      { value: 1, label: '1. 법정의무교육에 대해 잘 모른다' },
      { value: 2, label: '2. 법정의무교육에 대해 알고 있으나 실시하지 못하고 있다' },
      { value: 3, label: '3. 법정의무교육에 대해 알고 있으며 일부 실시하고 있다' },
      { value: 4, label: '4. 법정의무교육에 대해 알고 있으며 전부 실시하고 있다' }
    ],
    maxValue: 4
  },
  // Q13
  {
    id: 'q13',
    type: 'radio',
    question: '대표자의 교육에 관한 질문입니다',
    options: [
      { value: 1, label: '1. 사업준비로 다른 교육에 참여하지 않고 있다' },
      { value: 2, label: '2. 대표자를 위한 사회적경제 관련 기본교육을 들었다' },
      { value: 3, label: '3. 대표자를 위한 사회적경제와 업무(직무)에 관련된 교육 외에도 소셜캠퍼스에서 지원하는 인사, 마케팅, 회계 등 다양한 교육을 듣고있다' },
      { value: 4, label: '4. 3번 항목외에 사업에 필요한 외부의 다양한 교육을 찾아서 듣고 있다' }
    ],
    maxValue: 4
  },
  // Q14
  {
    id: 'q14',
    type: 'radio',
    question: '비즈니스모델에 관한 질문입니다',
    options: [
      { value: 1, label: '1. 주력 사업이 아직 정해지지 않았다' },
      { value: 2, label: '2. 주력 사업 관련, 제품/서비스가 개발 단계이다' },
      { value: 3, label: '3. 주력 사업 관련 제품/서비스를 생산하는데 필요한 원재료와 공급업체를 확보하였다' },
      { value: 4, label: '4. 주력 사업 관련, 제품/서비스를 생산하는 공정이 확립되었다' },
      { value: 5, label: '5. 주력 사업 관련, 제품/서비스의 유통경로가 확보되었다' },
      { value: 6, label: '6. 주력 사업 관련, 제품/서비스의 수익비용구조(예, 손익분기점)을 확인하였다' }
    ],
    maxValue: 6
  },
  // Q15
  {
    id: 'q15',
    type: 'radio',
    question: '정부,지자체의 지원사업에 관한 질문입니다',
    options: [
      { value: 1, label: '1. 지원사업을 받아본 적이 없다' },
      { value: 2, label: '2. 지원사업에 대해 알아보고 준비하고 있다' },
      { value: 3, label: '3. 지원사업을 받아 사업을 진행해 본 사례가 있다' },
      { value: 4, label: '4. 지원사업을 2회 이상 받아 사업을 진행하고 있다' }
    ],
    maxValue: 4
  },
  // Q16-Q18: 5점 척도
  {
    id: 'q16',
    type: 'scale',
    question: '기업의 핵심 역량을 높이기 위해 새로운 시도를 하고 있다',
    maxValue: 5
  },
  {
    id: 'q17',
    type: 'scale',
    question: '목표 시장에 주요 경쟁 아이템을 파악하고 경쟁력을 분석하고 있다',
    maxValue: 5
  },
  {
    id: 'q18',
    type: 'scale',
    question: '시장흐름이나 대외환경에 대해 정기적으로 점검을하고있다',
    maxValue: 5
  }
];

const scaleOptions = [
  { value: 1, label: '전혀 그렇지\n않다' },
  { value: 2, label: '그렇지\n않다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그렇다' },
  { value: 5, label: '매우\n그렇다' },
];

export function Survey() {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [companyName, setCompanyName] = useState('');
  const [author, setAuthor] = useState('');
  const [mentor, setMentor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  // 관리자는 설문 페이지에 접근 불가, 관리자 페이지로 리다이렉트
  useEffect(() => {
    if (auth.user?.isAdmin) {
      navigate('/admin');
    }
  }, [auth.user, navigate]);

  // 수정 모드 체크 및 데이터 로드
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      const surveysData = localStorage.getItem('surveys');
      if (surveysData) {
        const surveys = JSON.parse(surveysData);
        const surveyToEdit = surveys.find((s: any) => s.id === editId);
        
        if (surveyToEdit) {
          setEditMode(true);
          setEditingSurveyId(editId);
          setDate(surveyToEdit.date);
          setCompanyName(surveyToEdit.companyName);
          setAuthor(surveyToEdit.author);
          setMentor(surveyToEdit.mentor);
          setResponses(surveyToEdit.responses);
        }
      }
    }
  }, []);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId: string, value: number) => {
    setResponses(prev => {
      const current = prev[questionId] || [];
      const newValue = current.includes(value)
        ? current.filter((v: number) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [questionId]: newValue
      };
    });
  };

  const handleSubmit = () => {
    // Check if all fields are filled
    if (!companyName || !author || !mentor) {
      setError('기업명, 작성자, 멘토를 모두 입력해주세요.');
      return;
    }

    // Check if all questions are answered
    const allAnswered = surveyQuestions.every(q => {
      if (q.type === 'checkbox') {
        return responses[q.id] && responses[q.id].length > 0;
      }
      return responses[q.id] !== undefined;
    });

    if (!allAnswered) {
      setError('모든 문항에 답변해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    if (editMode && editingSurveyId) {
      // 수정 모드: 기존 설문 업데이트
      const existingSurveys = localStorage.getItem('surveys');
      const surveys = existingSurveys ? JSON.parse(existingSurveys) : [];
      const updatedSurveys = surveys.map((survey: any) => {
        if (survey.id === editingSurveyId) {
          return {
            ...survey,
            date,
            companyName,
            author,
            mentor,
            responses,
            updatedAt: new Date().toISOString()
          };
        }
        return survey;
      });
      localStorage.setItem('surveys', JSON.stringify(updatedSurveys));

      // 결과 페이지로 이동
      setTimeout(() => {
        setLoading(false);
        navigate(`/result/${editingSurveyId}`);
      }, 500);
    } else {
      // 새로 작성 모드: 새 설문 추가
      const surveyId = Date.now().toString();
      const surveyData = {
        id: surveyId,
        date,
        companyName,
        author,
        mentor,
        responses,
        surveyType: 'light-svi', // 현재는 Light-SVI만 지원
        submittedAt: new Date().toISOString()
      };

      // Get existing surveys
      const existingSurveys = localStorage.getItem('surveys');
      const surveys = existingSurveys ? JSON.parse(existingSurveys) : [];
      surveys.push(surveyData);
      localStorage.setItem('surveys', JSON.stringify(surveys));

      // Navigate to result
      setTimeout(() => {
        setLoading(false);
        navigate(`/result/${surveyId}`);
      }, 500);
    }
  };

  const answeredCount = surveyQuestions.filter(q => {
    if (q.type === 'checkbox') {
      return responses[q.id] && responses[q.id].length > 0;
    }
    return responses[q.id] !== undefined;
  }).length;
  const totalCount = surveyQuestions.length;

  // 테스트용 자동 채우기 함수
  const handleAutoFill = () => {
    const autoResponses: Record<string, any> = {};
    
    // 기업명 랜덤 채우기
    const companyNames = ['협동조합소셜랩', '사회적기업ABC', '소셜벤처XYZ', '커뮤니티협동조합', '임팩트컴퍼니'];
    setCompanyName(companyNames[Math.floor(Math.random() * companyNames.length)]);
    
    // 작성자 랜덤 채우기
    const authorNames = ['황유덕', '김철수', '이영희', '박민수', '정수진'];
    setAuthor(authorNames[Math.floor(Math.random() * authorNames.length)]);
    
    // 멘토 랜덤 채우기
    const mentorNames = ['장덕수', '서일화', '이상기', '황유덕'];
    setMentor(mentorNames[Math.floor(Math.random() * mentorNames.length)]);
    
    surveyQuestions.forEach(question => {
      if (question.type === 'binary') {
        autoResponses[question.id] = Math.random() > 0.5 ? '있다' : '없다';
      } else if (question.type === 'checkbox') {
        // 랜덤하게 1-3개 선택
        const numSelections = Math.floor(Math.random() * 3) + 1;
        const selected = [];
        const available = [1, 2, 3, 4];
        for (let i = 0; i < numSelections; i++) {
          const idx = Math.floor(Math.random() * available.length);
          selected.push(available[idx]);
          available.splice(idx, 1);
        }
        autoResponses[question.id] = selected;
      } else if (question.type === 'scale') {
        autoResponses[question.id] = Math.floor(Math.random() * 5) + 1;
      } else {
        // radio type
        const maxVal = question.maxValue || 4;
        autoResponses[question.id] = Math.floor(Math.random() * maxVal) + 1;
      }
    });
    
    setResponses(autoResponses);
  };

  // 초기화 함수
  const handleReset = () => {
    if (confirm('모든 입력 내용을 초기화하시겠습니까?')) {
      setResponses({});
      setCompanyName('');
      setAuthor('');
      setMentor('');
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
    }
  };

  const renderQuestion = (question: SurveyQuestion, index: number) => {
    if (question.type === 'binary') {
      return (
        <div 
          key={question.id}
          className="rounded-lg p-4 border-2"
          style={{ 
            background: 'white',
            borderColor: '#e2e8f0'
          }}
        >
          <div className="mb-2">
            <p className="text-sm font-semibold" style={{ color: '#2d3748' }}>
              {question.question}
            </p>
          </div>
          <div className="flex gap-2">
            {question.options?.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => handleResponseChange(question.id, option.value)}
                className={`
                  py-1.5 px-5 rounded-full border-2 transition-all font-medium text-sm
                  ${responses[question.id] === option.value
                    ? 'text-white'
                    : ''
                  }
                `}
                style={responses[question.id] === option.value
                  ? { 
                      background: '#c53030',
                      borderColor: '#c53030'
                    }
                  : { 
                      background: 'white',
                      borderColor: '#e2e8f0',
                      color: '#2d3748'
                    }
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (question.type === 'checkbox') {
      return (
        <div 
          key={question.id}
          className="rounded-lg p-6 border-2 transition-all hover:shadow-md"
          style={{ 
            background: '#f7fafc',
            borderColor: '#e2e8f0'
          }}
        >
          <div className="flex items-start gap-4 mb-5">
            <div 
              className="flex-shrink-0 w-12 h-12 text-white rounded flex items-center justify-center font-bold text-lg"
              style={{ background: '#3182ce' }}
            >
              {index}
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold leading-relaxed" style={{ color: '#2d3748' }}>
                {question.question}
              </p>
            </div>
          </div>
          <div className="space-y-3 ml-0">
            {question.options?.map((option) => (
              <div
                key={String(option.value)}
                onClick={() => handleCheckboxChange(question.id, option.value as number)}
                className={`
                  p-4 rounded-md border-2 transition-all cursor-pointer flex items-start gap-3
                  ${responses[question.id]?.includes(option.value)
                    ? ''
                    : 'hover:border-opacity-70'
                  }
                `}
                style={responses[question.id]?.includes(option.value)
                  ? { 
                      background: '#bee3f8',
                      borderColor: '#3182ce'
                    }
                  : { 
                      background: 'white',
                      borderColor: '#e2e8f0'
                    }
                }
              >
                <input
                  type="checkbox"
                  checked={responses[question.id]?.includes(option.value) || false}
                  onChange={() => {}}
                  className="mt-1 w-5 h-5 cursor-pointer"
                  style={{ accentColor: '#3182ce' }}
                />
                <label className="flex-1 cursor-pointer" style={{ color: '#2d3748' }}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (question.type === 'scale') {
      return (
        <div 
          key={question.id}
          className="rounded-lg p-6 border-2 transition-all hover:shadow-md"
          style={{ 
            background: '#f7fafc',
            borderColor: '#e2e8f0'
          }}
        >
          <div className="flex items-start gap-4 mb-5">
            <div 
              className="flex-shrink-0 w-12 h-12 text-white rounded flex items-center justify-center font-bold text-lg"
              style={{ background: '#3182ce' }}
            >
              {index}
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold leading-relaxed" style={{ color: '#2d3748' }}>
                {question.question}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-3 ml-0">
            {scaleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleResponseChange(question.id, option.value)}
                className={`
                  py-4 px-2 rounded-md border-2 transition-all text-center font-semibold
                  ${responses[question.id] === option.value
                    ? 'text-white shadow-md transform -translate-y-1'
                    : 'hover:border-opacity-70'
                  }
                `}
                style={responses[question.id] === option.value
                  ? { 
                      background: '#3182ce',
                      borderColor: '#3182ce',
                      boxShadow: '0 4px 8px rgba(49, 130, 206, 0.3)'
                    }
                  : { 
                      background: 'white',
                      borderColor: '#e2e8f0',
                      color: '#2d3748'
                    }
                }
              >
                <div className="text-xl font-bold mb-2">{option.value}</div>
                <div className="text-xs leading-tight whitespace-pre-line">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // radio type
    return (
      <div 
        key={question.id}
        className="rounded-lg p-6 border-2 transition-all hover:shadow-md"
        style={{ 
          background: '#f7fafc',
          borderColor: '#e2e8f0'
        }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div 
            className="flex-shrink-0 w-12 h-12 text-white rounded flex items-center justify-center font-bold text-lg"
            style={{ background: '#3182ce' }}
          >
            {index}
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold leading-relaxed" style={{ color: '#2d3748' }}>
              {question.question}
            </p>
          </div>
        </div>
        <div className="space-y-3 ml-0">
          {question.options?.map((option) => (
            <div
              key={String(option.value)}
              onClick={() => handleResponseChange(question.id, option.value)}
              className={`
                p-4 rounded-md border-2 transition-all cursor-pointer flex items-start gap-3
                ${responses[question.id] === option.value
                  ? ''
                  : 'hover:border-opacity-70'
                }
              `}
              style={responses[question.id] === option.value
                ? { 
                    background: '#bee3f8',
                    borderColor: '#3182ce'
                  }
                : { 
                    background: 'white',
                    borderColor: '#e2e8f0'
                  }
              }
            >
              <input
                type="radio"
                checked={responses[question.id] === option.value}
                onChange={() => {}}
                className="mt-1 w-5 h-5 cursor-pointer"
                style={{ accentColor: '#3182ce' }}
              />
              <label className="flex-1 cursor-pointer" style={{ color: '#2d3748' }}>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-white rounded-t-lg shadow-sm px-8 py-6 mb-0" style={{ background: '#5a7077' }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">기업 자가진단 (초기창업형) - Light-SVI 진단툴</h1>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white border-x px-8 py-6" style={{ borderColor: '#e2e8f0' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="block text-sm font-medium mb-2" style={{ color: '#2d3748' }}>일시:</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white"
                style={{ borderColor: '#cbd5e0', backgroundColor: 'white' }}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2" style={{ color: '#2d3748' }}>기업명:</Label>
              <Input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="협동조합소셜랩"
                className="w-full border rounded-md px-3 py-2 bg-white"
                style={{ borderColor: '#cbd5e0', backgroundColor: 'white' }}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2" style={{ color: '#2d3748' }}>멘토: <span style={{ color: '#e53e3e' }}>*</span></Label>
              <select
                value={mentor}
                onChange={(e) => setMentor(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white"
                style={{ borderColor: '#cbd5e0', backgroundColor: 'white', color: mentor ? '#2d3748' : '#a0aec0' }}
                required
              >
                <option value="" disabled>멘토를 선택해주세요</option>
                <option value="장덕수">장덕수</option>
                <option value="서일화">서일화</option>
                <option value="이상기">이상기</option>
                <option value="황유덕">황유덕</option>
              </select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2" style={{ color: '#2d3748' }}>작성자:</Label>
              <Input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="황유덕"
                className="w-full border rounded-md px-3 py-2 bg-white"
                style={{ borderColor: '#cbd5e0', backgroundColor: 'white' }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: '#e2e8f0' }}>
            <div 
              className="h-2 rounded-full transition-all"
              style={{ 
                background: '#5a7077',
                width: `${(answeredCount / totalCount) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Survey Questions */}
        <div className="bg-white rounded-b-lg shadow-sm pb-8">
          {/* 기본 정보 섹션 */}
          <div className="px-8 pt-8 mb-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#5a7077' }}>기본 정보</h3>
            <div className="space-y-4">
              {surveyQuestions.slice(0, 2).map((question, index) => renderQuestion(question, index))}
            </div>
          </div>

          {/* 나머지 질문들 */}
          <div className="px-8 pt-2 space-y-6">
            {surveyQuestions.slice(2).map((question, index) => renderQuestion(question, index + 1))}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md p-4 border-2" style={{ background: '#fff5f5', borderColor: '#fc8181' }}>
            <p className="text-sm" style={{ color: '#742a2a' }}>{error}</p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-12 py-4 text-base text-white rounded-full font-bold transition-all hover:transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none whitespace-nowrap"
            style={{ 
              background: '#5a7077',
              boxShadow: '0 4px 15px rgba(90, 112, 119, 0.3)'
            }}
          >
            {loading ? '분석 중...' : '제출 및 보고서 생성'}
          </button>
        </div>

        {/* 자동채우기 버튼 */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleAutoFill}
            className="px-4 py-2 text-xs rounded-md font-medium transition-all hover:opacity-80 whitespace-nowrap"
            style={{ 
              background: '#e2e8f0',
              color: '#4a5568',
              border: '1px solid #cbd5e0',
              opacity: 0.5
            }}
          >
            자동채우기
          </button>
        </div>
      </div>
    </div>
  );
}