// 고정된 사용자 계정 (DB 연동 없이 로컬에서 작동)
const FIXED_USERS = [
  {
    id: 'admin-001',
    username: 'admin',
    password: 'thtuffoq2026@',
    name: '관리자',
    isAdmin: true
  },
  {
    id: 'user-001',
    username: 'user',
    password: 'user2026',
    name: '일반사용자',
    isAdmin: false
  }
];

export interface User {
  id: string;
  username: string;
  name: string;
  isAdmin: boolean;
}

// 로그인
export function signIn(username: string, password: string): User | null {
  const user = FIXED_USERS.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }
  
  return null;
}

// 로그아웃
export function signOut(): void {
  localStorage.removeItem('currentUser');
}

// 현재 로그인된 사용자 가져오기
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// 관리자 권한 확인
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.isAdmin || false;
}