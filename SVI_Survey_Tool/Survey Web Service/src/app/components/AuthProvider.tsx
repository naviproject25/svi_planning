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
  // 기존 데이터에 mentor 필드가 없으면 갱신
  const surveysData = localStorage.getItem('surveys');
  if (surveysData) {
    const existing = JSON.parse(surveysData);
    const hasAllMentors = existing.every((s: any) => s.mentor);
    if (hasAllMentors) return;
  }

  // 테스트 설문 데이터 생성
  const testSurveys = [
    {
      id: 'test-survey-001',
      userId: 'user@test.com',
      date: '2025-02-01',
      companyName: '(주)대한민국사회적경제혁신센터',
      author: '김철수',
      mentor: '장덕수',
      responses: {
        businessExp: '있다',
        industryExp: '있다',
        q1: 3,
        q2: 4,
        q3: 3,
        q4: ['노인', '장애인'],
        q5: 2,
        q6: 3,
        q7: 2,
        q8: 3,
        q9: 3,
        q10: 4,
        q11: 4,
        q12: 3,
        q13: 3,
        q14: 4,
        q15: 3,
        q16: 4,
        q17: 3,
        q18: 3
      },
      submitted: true,
      submittedAt: '2025-02-01T14:30:00.000Z'
    },
    {
      id: 'test-survey-002',
      userId: 'user@test.com',
      date: '2025-02-05',
      companyName: '협동조합 함께',
      author: '이영희',
      mentor: '서일화',
      responses: {
        businessExp: '없다',
        industryExp: '있다',
        q1: 4,
        q2: 3,
        q3: 4,
        q4: ['청소년', '아동'],
        q5: 3,
        q6: 4,
        q7: 3,
        q8: 2,
        q9: 3,
        q10: 3,
        q11: 5,
        q12: 4,
        q13: 3,
        q14: 5,
        q15: 4,
        q16: 3,
        q17: 4,
        q18: 4
      },
      submitted: true,
      submittedAt: '2025-02-05T09:15:00.000Z'
    },
    {
      id: 'test-survey-003',
      userId: 'user@test.com',
      date: '2025-02-08',
      companyName: '사회적기업 미래',
      author: '박민수',
      mentor: '이상기',
      responses: {
        businessExp: '있다',
        industryExp: '없다',
        q1: 2,
        q2: 3,
        q3: 2,
        q4: ['저소득층'],
        q5: 2,
        q6: 2,
        q7: 1,
        q8: 2,
        q9: 2,
        q10: 3,
        q11: 3,
        q12: 2,
        q13: 2,
        q14: 3,
        q15: 2,
        q16: 3,
        q17: 2,
        q18: 2
      },
      submitted: true,
      submittedAt: '2025-02-08T16:45:00.000Z'
    },
    {
      id: 'test-survey-004',
      userId: 'user@test.com',
      date: '2025-02-10',
      companyName: '커뮤니티 비즈',
      author: '최지현',
      mentor: '황유덕',
      responses: {
        businessExp: '있다',
        industryExp: '있다',
        q1: 4,
        q2: 4,
        q3: 4,
        q4: ['여성', '장애인', '노인'],
        q5: 4,
        q6: 4,
        q7: 4,
        q8: 4,
        q9: 4,
        q10: 5,
        q11: 5,
        q12: 4,
        q13: 4,
        q14: 5,
        q15: 4,
        q16: 5,
        q17: 4,
        q18: 5
      },
      submitted: true,
      submittedAt: '2025-02-10T11:20:00.000Z'
    }
  ];

  localStorage.setItem('surveys', JSON.stringify(testSurveys));
  console.log('✅ 테스트 데이터 생성 완료 (4개 제출된 설문)');
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