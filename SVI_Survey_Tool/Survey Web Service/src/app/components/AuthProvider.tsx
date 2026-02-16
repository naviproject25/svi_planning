import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, signOut as authSignOut, User } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  refreshUser: () => {},
});

// 테스트 데이터 생성 함수
function initializeTestData() {
  const surveysData = localStorage.getItem('surveys');
  if (surveysData) {
    const existing = JSON.parse(surveysData);
    // surveyType이 있는 데이터면 이미 갱신된 것
    if (existing.some((s: any) => s.surveyType)) return;
  }

  const testSurveys = [
    // 기초 진단 6건
    {
      id: 'test-basic-001', date: '2026-01-10', companyName: '(주)대한민국사회적경제혁신센터', author: '김철수', mentor: '장덕수',
      surveyType: 'basic-svi', submitted: true, submittedAt: '2026-01-10T14:30:00.000Z',
      responses: { businessExp: '있다', industryExp: '있다', q1: 3, q2: 4, q3: 3, q4: [1, 2], q5: 2, q6: 3, q7: 2, q8: 3, q9: 3, q10: 4, q11: 4, q12: 3, q13: 3, q14: 4, q15: 3, q16: 4, q17: 3, q18: 3 }
    },
    {
      id: 'test-basic-002', date: '2026-01-15', companyName: '협동조합 함께', author: '이영희', mentor: '서일화',
      surveyType: 'basic-svi', submitted: true, submittedAt: '2026-01-15T09:15:00.000Z',
      responses: { businessExp: '없다', industryExp: '있다', q1: 4, q2: 3, q3: 4, q4: [3, 4], q5: 3, q6: 4, q7: 3, q8: 2, q9: 3, q10: 3, q11: 5, q12: 4, q13: 3, q14: 5, q15: 4, q16: 3, q17: 4, q18: 4 }
    },
    {
      id: 'test-basic-003', date: '2026-01-20', companyName: '사회적기업 미래', author: '박민수', mentor: '이상기',
      surveyType: 'basic-svi', submitted: true, submittedAt: '2026-01-20T16:45:00.000Z',
      responses: { businessExp: '있다', industryExp: '없다', q1: 2, q2: 3, q3: 2, q4: [1], q5: 2, q6: 2, q7: 1, q8: 2, q9: 2, q10: 3, q11: 3, q12: 2, q13: 2, q14: 3, q15: 2, q16: 3, q17: 2, q18: 2 }
    },
    {
      id: 'test-basic-004', date: '2026-02-01', companyName: '커뮤니티 비즈', author: '최지현', mentor: '황유덕',
      surveyType: 'basic-svi', submitted: true, submittedAt: '2026-02-01T11:20:00.000Z',
      responses: { businessExp: '있다', industryExp: '있다', q1: 4, q2: 4, q3: 4, q4: [1, 2, 3], q5: 4, q6: 4, q7: 4, q8: 4, q9: 4, q10: 5, q11: 5, q12: 4, q13: 4, q14: 5, q15: 4, q16: 5, q17: 4, q18: 5 }
    },
    {
      id: 'test-basic-005', date: '2026-02-05', companyName: '소셜벤처 나눔', author: '정수빈', mentor: '장덕수',
      surveyType: 'basic-svi', submitted: true, submittedAt: '2026-02-05T10:00:00.000Z',
      responses: { businessExp: '없다', industryExp: '없다', q1: 1, q2: 2, q3: 1, q4: [2], q5: 1, q6: 2, q7: 1, q8: 1, q9: 1, q10: 2, q11: 2, q12: 1, q13: 1, q14: 2, q15: 1, q16: 2, q17: 1, q18: 1 }
    },
    {
      id: 'test-basic-006', date: '2026-02-10', companyName: '협동조합 가나다라', author: '홍길동', mentor: '서일화',
      surveyType: 'basic-svi', submitted: true, submittedAt: '2026-02-10T13:30:00.000Z',
      responses: { businessExp: '있다', industryExp: '있다', q1: 3, q2: 3, q3: 3, q4: [1, 3, 4], q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 4, q11: 4, q12: 3, q13: 3, q14: 4, q15: 3, q16: 4, q17: 3, q18: 3 }
    },
    // 심화 진단 4건
    {
      id: 'test-adv-001', date: '2026-01-12', companyName: '소셜임팩트 주식회사', author: '강민호', mentor: '이상기',
      surveyType: 'advanced-svi', submitted: true, submittedAt: '2026-01-12T15:00:00.000Z',
      responses: { businessExp: '있다', industryExp: '있다', q1: 4, q2: 5, q3: 4, q4: 5, q5: 4, q6: [1, 2, 3, 4], q7: [1, 2, 3], q8: 4, q9: 4, q10: 3, q11: 4, q12: 4, q13: 3, q14: 5, q15: 6, q16: 4, q17: 4, q18: 4, q19: 5, q20: 5, q21: 4, q22: [2, 3, 5, 6], q23: 4, q24: 5, q25: 4, q26: 4, q27: 5, q28: 4, q29: [4, 6, 10, 14, 18] }
    },
    {
      id: 'test-adv-002', date: '2026-01-25', companyName: '그린에너지 협동조합', author: '윤서연', mentor: '황유덕',
      surveyType: 'advanced-svi', submitted: true, submittedAt: '2026-01-25T11:30:00.000Z',
      responses: { businessExp: '없다', industryExp: '있다', q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: [1, 2], q7: [1, 4], q8: 3, q9: 2, q10: 2, q11: 3, q12: 3, q13: 2, q14: 3, q15: 4, q16: 3, q17: 3, q18: 3, q19: 3, q20: 4, q21: 3, q22: [1, 4], q23: 3, q24: 3, q25: 3, q26: 3, q27: 3, q28: 3, q29: [1, 5, 8, 12] }
    },
    {
      id: 'test-adv-003', date: '2026-02-03', companyName: '도시농부 사회적기업', author: '한지우', mentor: '장덕수',
      surveyType: 'advanced-svi', submitted: true, submittedAt: '2026-02-03T09:45:00.000Z',
      responses: { businessExp: '있다', industryExp: '없다', q1: 2, q2: 2, q3: 2, q4: 2, q5: 2, q6: [1], q7: [1, 2], q8: 2, q9: 1, q10: 1, q11: 2, q12: 2, q13: 1, q14: 2, q15: 3, q16: 2, q17: 2, q18: 2, q19: 2, q20: 3, q21: 2, q22: [1], q23: 2, q24: 2, q25: 2, q26: 2, q27: 2, q28: 2, q29: [6, 10] }
    },
    {
      id: 'test-adv-004', date: '2026-02-12', companyName: '행복한 돌봄센터', author: '오태경', mentor: '서일화',
      surveyType: 'advanced-svi', submitted: true, submittedAt: '2026-02-12T14:20:00.000Z',
      responses: { businessExp: '있다', industryExp: '있다', q1: 4, q2: 4, q3: 4, q4: 4, q5: 3, q6: [1, 2, 3, 5, 6], q7: [1, 2, 3, 4], q8: 3, q9: 3, q10: 4, q11: 3, q12: 3, q13: 4, q14: 4, q15: 5, q16: 5, q17: 4, q18: 4, q19: 4, q20: 5, q21: 4, q22: [2, 3, 4, 5, 6], q23: 3, q24: 4, q25: 4, q26: 3, q27: 4, q28: 5, q29: [1, 3, 4, 6, 8, 10, 12, 14, 18] }
    }
  ];

  localStorage.setItem('surveys', JSON.stringify(testSurveys));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const signOut = () => {
    authSignOut();
    setUser(null);
  };

  useEffect(() => {
    // 앱 초기화 시 테스트 데이터 생성
    initializeTestData();
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}