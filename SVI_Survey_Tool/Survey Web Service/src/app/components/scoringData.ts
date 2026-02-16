// ============================================================
// SVI 진단 점수 산출 데이터 (Excel 기반 deterministic lookup)
// ============================================================

// --- 공통 타입 ---
export type SurveyType = 'basic-svi' | 'advanced-svi';

export interface ScoreComment {
  score: number;
  comment: string;
}

export interface FactorDef {
  name: string;
  category: string;
  perspective: string;
  questions: string[]; // q번호 배열
  calcType: 'lookup' | 'multiselect' | 'likert' | 'sum' | 'average' | 'combined';
}

export interface GraphFactorDef {
  group: string; // 범주명
  name: string;
}

export interface CategoryThreshold {
  category: string;
  threshold: number;
}

// --- 5개 범주 / 3개 관점 (기초·심화 공통) ---
export const CATEGORIES = ['조직미션', '사업활동', '조직운영', '재정성과', '기업혁신'] as const;
export const PERSPECTIVES = ['사회적성과', '경제적성과', '혁신성과'] as const;

export const CATEGORY_TO_PERSPECTIVE: Record<string, string> = {
  '조직미션': '사회적성과',
  '사업활동': '사회적성과',
  '조직운영': '사회적성과',
  '재정성과': '경제적성과',
  '기업혁신': '혁신성과',
};

// 사회적성과 = AVG(조직미션, 사업활동, 조직운영)
// 경제적성과 = 재정성과
// 혁신성과 = 기업혁신

// --- Code 판정 Threshold (기초·심화 공통) ---
export const CODE_THRESHOLDS: CategoryThreshold[] = [
  { category: '조직미션', threshold: 3.25 },
  { category: '사업활동', threshold: 3.20 },
  { category: '조직운영', threshold: 2.10 },
  { category: '재정성과', threshold: 2.60 },
  { category: '기업혁신', threshold: 2.50 },
];

// ============================================================
// 기초진단 데이터
// ============================================================

// 기초 문항별 배점 테이블: [score, comment]
// lookup 타입: 응답값(선택지 인덱스 기반)에 맞는 score/comment 반환
export const BASIC_SCORING: Record<string, ScoreComment[]> = {
  q1: [
    { score: 0.5, comment: '해결하고자 하는 사회적문제를 명확히 정의하고' },
    { score: 1, comment: '사회적문제 해결을 위한 구체적인 해결 계획을 수립하고' },
    { score: 4, comment: '사회적문제 해결을 위한 계획과 목표달성을 위한 세부전략을 마련하고' },
    { score: 5, comment: '사회적문제 해결을 위한 시도의 결과를 분석하며 개선점을 도출하고' },
  ],
  q2: [
    { score: 0.5, comment: '사업계획 목표와 전략을 명확히 문서화하여 공유해야할 필요있음' },
    { score: 1, comment: '사업계획을 팀원과 공유하며 주기적으로 검토해야함' },
    { score: 4, comment: '사업계획 내 성과 지표를 설정하며 목표 달성을 위한 실행 계획수립을 권장함' },
    { score: 5, comment: '사업성과를 정기적으로 평가하며 피드백을 통해 계획을 보완하여야함' },
  ],
  q3: [
    { score: 0.5, comment: '업무재해 위험 요소를 파악하여 안전 교육을 실시하고' },
    { score: 1, comment: '근로자를 위한 업무재해 위험요소의 대비책 마련을 하고' },
    { score: 4, comment: '근로자 안전을 위한 체계적인 교육 시스템을 구축하고' },
    { score: 5, comment: '근로자 안전을 위한 안전 문화를 정착시키고' },
  ],
  // q4: 멀티셀렉트 (count × 1.25)
  q4: [
    { score: 1.25, comment: '상품의 차별성을 강조하며 마케팅 전략을 강화해야함' },
    { score: 2.5, comment: '상품 가격 경쟁력을 유지하고 품질보장 방법을 모색해야함' },
    { score: 3.75, comment: '지속적인 취약계층의 고용을 유지하길 권장함' },
    { score: 5, comment: '지역 자원의 활용도 증대와 지역 사회와의 협력을 강화해야함' },
  ],
  q5: [
    { score: 0, comment: '사회적경제 협력활동 관련정보를 조사하며 참여기회를 찾고' },
    { score: 0.5, comment: '사회적경제 협력활동 모임에 적극참여하며 협력기회를 모색하고' },
    { score: 1, comment: '사회적경제 협력 회원사들과 실질적 협력 방안을 마련하고' },
    { score: 1.5, comment: '사회적경제기업과 협력사업을 확대하며 지속가능한 관계를 구축하고' },
  ],
  q6: [
    { score: 0.5, comment: '사회적경제기업 관련 기업을 조사하며 거래 기회를 찾아' },
    { score: 1, comment: '사회적경제기업과 거래 조건을 검토하며 협력방안을 논의하고' },
    { score: 2, comment: '사회적경제기업과 협력사례를 분석하며 추가 협력방안을 모색하고' },
    { score: 3.5, comment: '사회적경제기업과 협력 성과를 평가하며 지속가능한 관계를 유지하고' },
  ],
  q7: [
    { score: 0.5, comment: '지역기업과의 거래를 우선하여 지역경제 활성화에 기여해야함' },
    { score: 1, comment: '지역기업과의 구체적인 계획을 수립하며 협력을 강화해야함' },
    { score: 4, comment: '지역거래 기업과의 관계를 지속적으로 발전시키길 권장함' },
    { score: 5, comment: '추가적으로 지역사회에 기여하는 방안을 모색해야함' },
  ],
  q8: [
    { score: 0.5, comment: '(예비)사회적기업 인지정 요건으로 사회적환원 필요성을 인지하고' },
    { score: 1, comment: '사회적환원 범위에 대한 내용을 인지하고 계획을 수립하고' },
    { score: 4, comment: '사회적환원 비율을 높이기위한 계획 수립과 실행을하고' },
    { score: 5, comment: '사회적 환원 활동의 효과를 평가해 향후 환원 계획을 수립해야함' },
  ],
  q9: [
    { score: 0.5, comment: '사회서비스 제공을 위해 자원과 인력 확보 방안 모색해야함' },
    { score: 1, comment: '사회서비스 제공 계획을 실행 가능 방안을 마련해야함' },
    { score: 4, comment: '정기적 사회서비스 제공 활동으로 지속적 지원체계를 구축해야함' },
    { score: 5, comment: '사회서비스 제공 성과 개선 방안 도출이 필요함' },
  ],
  q10: [
    { score: 0.5, comment: '이사회 또는 운영위원회를 조속히 구성하여 운영 방안을 마련하고' },
    { score: 1, comment: '정기적인 회의를 통해 의사결정 과정을 투명하게 운영하고' },
    { score: 2, comment: '최소 반기별 1회를 정기적인 의사결정기구를 운영하고' },
    { score: 3, comment: '의사결정기구 회의결과를 근로자에게 공유해야하고' },
    { score: 5, comment: '근로자들이 회의결과에 대해 의견을 제시할 수 있는 기회를 제공하고' },
  ],
  q11: [
    { score: 0.5, comment: '고용 계획 수립과 인력확보 방안 모색이 필요함' },
    { score: 1, comment: '구체적인 고용 계획 실행방안이 필요함' },
    { score: 2, comment: '고용 계획수립과 인력확보 방안을 모색해야함' },
    { score: 3, comment: '구체적인 고용 계획 수립과 실천노력이 필요함' },
    { score: 4, comment: '지속적인 고용유지와 확대를 위한 노력을 권장함' },
    { score: 5, comment: '향후 인력 관리체계를 수립하길 권장함' },
  ],
  q12: [
    { score: 0, comment: '법정의무교육 정보를 찾아서 교육계획을 수립하고' },
    { score: 0.5, comment: '구체적인 법정의무교육계획을 수립하고' },
    { score: 1, comment: '법정의무교육을 실시하며 추가교육 계획을 수립하고' },
    { score: 1.5, comment: '이슈현황을 문서화하여 체계적으로 관리하고' },
  ],
  q13: [
    { score: 0, comment: '대표자가 교육을 적극적으로 찾고 참여해야함' },
    { score: 1, comment: '대표자의 지속적인 학습을 위해 노력해야함' },
    { score: 2, comment: '대표자가 교육내용을 기업에 적용할 수 있도록함' },
    { score: 3.5, comment: '대표자의 교육수료 내용을 구성원들과 공유하길 권장함' },
  ],
  q14: [
    { score: 0.5, comment: '사업의 내용을 명확히 정의하고' },
    { score: 1, comment: '제품/서비스 프로토타입 제작과 테스트를 실시하며 개선하고' },
    { score: 2, comment: '제품/서비스 안정적인 공급망을 유지하며 품질관리를 위해 노력하고' },
    { score: 3, comment: '제품/서비스 품질을 지속적으로 개선하고' },
    { score: 4, comment: '제품/서비스 유통 경로를 다각화고' },
    { score: 5, comment: '제품/서비스의 수익성을 극대화하고' },
  ],
  q15: [
    { score: 0.5, comment: '지원사업 정보도 관심을 갖기를 권함' },
    { score: 1, comment: '지원사업신청에 집중을 권장함' },
    { score: 4, comment: '지원사업 경험을 바탕으로 지속 가능한 수익모델을 개발해야함' },
    { score: 5, comment: '지원사업 종료 후의 후속사업을 준비해야함' },
  ],
  // q16~q18: 리커트 1-5 (그대로 점수)
  q16: [
    { score: 1, comment: '실패 사례를 분석하여 새로운 시도의 방향성을 설정하고' },
    { score: 2, comment: '외부 전문가 컨설팅을 통해 전략점검/개선 방안을 모색하고' },
    { score: 3, comment: '새로운 아이디어를 제안하는 시스템을 도입하여 직원들의 참여를 유도하고' },
    { score: 4, comment: '정기적인 내부 교육과 워크숍을 통해 직원들의 역량을 지속적으로 강화하고' },
    { score: 5, comment: '혁신적인 프로젝트를 통해 새로운 시장 진입을 적극적으로 시도하고' },
  ],
  q17: [
    { score: 1, comment: '경쟁사의 성공 사례를 벤치마킹하여 전략을 수립하고' },
    { score: 2, comment: '경쟁사와의 비교 분석을 통해 자사 제품의 차별성을 강조하는 마케팅 전략을 수립하고' },
    { score: 3, comment: '정기적으로 경쟁사 모니터링을 실시하여 시장 변화에 신속하게 대응하고' },
    { score: 4, comment: '정기적으로 경쟁사 모니터링을 실시하여 시장 변화에 신속하게 대응하고' },
    { score: 5, comment: '정기적으로 경쟁사 모니터링을 실시하여 시장 변화에 신속하게 대응하고' },
  ],
  q18: [
    { score: 1, comment: '업계 전문가와의 네트워킹 등을 통해 최신 정보를 지속적으로 확보한다' },
    { score: 2, comment: '업계 전문가와의 네트워킹 등을 통해 최신 정보를 지속적으로 확보한다' },
    { score: 3, comment: '기업 내부에서 대외환경 변화에 대한 의견을 수렴하고 논의한다' },
    { score: 4, comment: '점검, 분석결과를 통해 대응방안을 마련한다' },
    { score: 5, comment: '점검, 분석결과를 통해 대응방안을 마련한다' },
  ],
};

// 기초 요인 → 범주 → 관점 구조
// 요인명 / 사용문항 / 계산방식
export const BASIC_FACTORS: FactorDef[] = [
  { name: '소셜미션', category: '조직미션', perspective: '사회적성과', questions: ['q1'], calcType: 'lookup' },
  { name: '성과관리체계', category: '조직미션', perspective: '사회적성과', questions: ['q2'], calcType: 'lookup' },
  { name: '기업의 사회적가치', category: '사업활동', perspective: '사회적성과', questions: ['q3'], calcType: 'lookup' },
  { name: '사회적가치(다중)', category: '사업활동', perspective: '사회적성과', questions: ['q4'], calcType: 'multiselect' },
  { name: '사회적경제기업 협력', category: '사업활동', perspective: '사회적성과', questions: ['q5', 'q6'], calcType: 'sum' },
  { name: '지역협력', category: '사업활동', perspective: '사회적성과', questions: ['q7'], calcType: 'lookup' },
  { name: '사회환원', category: '사업활동', perspective: '사회적성과', questions: ['q8', 'q9'], calcType: 'average' },
  { name: '조직 거버넌스', category: '조직운영', perspective: '사회적성과', questions: ['q10'], calcType: 'lookup' },
  { name: '고용', category: '조직운영', perspective: '사회적성과', questions: ['q11'], calcType: 'lookup' },
  { name: '내부역량향상', category: '조직운영', perspective: '사회적성과', questions: ['q12', 'q13'], calcType: 'sum' },
  { name: '비즈니스모델', category: '재정성과', perspective: '경제적성과', questions: ['q14'], calcType: 'lookup' },
  { name: '경제적성과', category: '재정성과', perspective: '경제적성과', questions: ['q15'], calcType: 'lookup' },
  { name: '성장잠재력', category: '기업혁신', perspective: '혁신성과', questions: ['q16'], calcType: 'likert' },
  { name: '사업아이템', category: '기업혁신', perspective: '혁신성과', questions: ['q17'], calcType: 'likert' },
  { name: '시장분석', category: '기업혁신', perspective: '혁신성과', questions: ['q18'], calcType: 'likert' },
];

// 기초 그래프 요인 (13개) - 막대그래프에 표시
export const BASIC_GRAPH_FACTORS: GraphFactorDef[] = [
  { group: '조직미션', name: '소셜미션' },
  { group: '조직미션', name: '성과관리체계' },
  { group: '사업활동', name: '기업의 사회적가치' },
  { group: '사업활동', name: '사회적경제기업 협력' },
  { group: '사업활동', name: '지역협력' },
  { group: '사업활동', name: '사회환원' },
  { group: '조직운영', name: '조직 거버넌스' },
  { group: '조직운영', name: '고용' },
  { group: '조직운영', name: '내부역량향상' },
  { group: '재정성과', name: '비즈니스모델' },
  { group: '재정성과', name: '경제적성과' },
  { group: '기업혁신', name: '성장잠재력' },
  { group: '기업혁신', name: '사업아이템' },
];

// 기초 32개 Code → 코멘트 매핑
export const BASIC_CODE_COMMENTS: Record<string, string> = {
  '22222': '전 영역이 고르게 우수합니다. 현재의 균형잡힌 발전 전략을 지속하면서, 사회적 가치와 경제적 성과의 시너지를 더욱 강화하시기 바랍니다. 타기업과의 협업을 증진시키고 성과 공유를 통해 기업 전체의 목표를 통합적으로 달성할 수 있는 환경을 조성해야 합니다. 또한 정기적인 성과 평가를 통해 지속 가능한 발전을 도모하고 사회적 책임을 다하는 기업으로 나아가야 합니다.',
  '22122': '조직운영 체계 보완이 필요합니다. 근로자 권익보호와 민주적 의사결정 구조 강화를 통해 사회적 가치 실현의 완성도를 높이시기 바랍니다.',
  '21222': '사업활동 영역 강화가 필요합니다. 사회적 가치 창출을 위한 구체적 사업계획 수립과 실행방안 모색이 요구됩니다.',
  '21122': '사업활동과 조직운영이 취약합니다. 사회적 미션은 명확하나 이를 실현하기 위한 구체적 실행체계 구축이 시급합니다.',
  '12222': '소셜미션 구체화가 필요합니다. 사업성과는 우수하나, 해결하고자 하는 사회문제와 그 해결방안을 더욱 명확히 하시기 바랍니다.',
  '12122': '조직 미션과 운영체계 보완이 필요합니다. 사업성과는 우수하나 사회적 가치 지향성 강화와 내부 운영시스템 개선이 요구됩니다.',
  '11222': '소셜미션 구체화와 사업활동 보완이 필요합니다. 경제적 성과는 우수하나 사회적 가치 창출 방안을 구체화하시기 바랍니다.',
  '11122': '사회적 가치 영역 전반의 보완이 필요합니다. 경제적 및 혁신 성과는 우수하나 사회적기업으로서의 기본 요건 강화가 시급합니다.',
  '22221': '혁신성과 제고가 필요합니다. 사회적·경제적 성과는 우수하나 지속가능한 성장을 위한 혁신 노력 강화가 요구됩니다.',
  '22121': '조직운영과 혁신성과 개선이 필요합니다. 시장환경 변화에 대응할 수 있는 조직체계 구축과 혁신역량 강화가 요구됩니다.',
  '21221': '사업활동과 혁신성과 개선이 필요합니다. 사회가치 실현을 위한 사업모델 혁신과 새로운 시도가 요구됩니다.',
  '21121': '사업운영 전반의 혁신이 필요합니다. 소셜미션 실현을 위한 조직운영 체계 개선과 혁신적 사업방식 도입이 요구됩니다.',
  '12221': '미션 구체화와 혁신역량 강화가 필요합니다. 안정적 사업기반 위에 사회적 가치 창출을 위한 혁신적 접근이 요구됩니다.',
  '12121': '조직 미션·운영과 혁신역량 강화가 필요합니다. 경제적 성과를 사회적 가치로 연계하는 혁신적 방안 모색이 요구됩니다.',
  '11221': '사회적가치 창출 기반 강화가 필요합니다. 조직운영은 양호하나 사회적 미션 구체화와 혁신적 사업방식 도입이 요구됩니다.',
  '11121': '사회적 가치 영역 전반의 혁신이 필요합니다. 경제적 성과를 사회적 가치로 전환하는 혁신적 사업모델 구축이 시급합니다.',
  '22212': '경제적 성과 제고가 필요합니다. 사회적 가치 실현 기반은 우수하나 수익모델 강화와 시장 확대가 요구됩니다.',
  '22112': '조직운영과 경제적 성과 개선이 필요합니다. 혁신역량을 경제적 성과로 연계하는 사업전략 수립이 요구됩니다.',
  '21212': '사업활동과 경제적 성과 개선이 필요합니다. 혁신적 시도를 실질적 매출성과로 연계하는 방안 모색이 시급합니다.',
  '21112': '사업운영과 경제성과 개선이 필요합니다. 혁신역량을 활용한 수익모델 구체화와 시장 확대 전략 수립이 요구됩니다.',
  '12212': '소셜미션 구체화와 경제적 성과 개선이 필요합니다. 혁신역량을 활용한 안정적 수익구조 확보가 시급합니다.',
  '12112': '조직 미션·운영 체계와 경제적 성과 개선이 필요합니다. 혁신역량의 경제적 성과 연계가 요구됩니다.',
  '11212': '사업활동 강화와 경제적 성과 개선이 필요합니다. 혁신역량을 활용한 실질적 매출 증대 방안 수립이 시급합니다.',
  '11112': '사회적 가치 기반 강화와 경제적 성과 개선이 필요합니다. 혁신역량을 활용한 수익모델 확립이 시급합니다.',
  '22211': '경영역량 강화가 시급합니다. 사회적 가치 기반은 우수하나 지속가능성 확보를 위한 경영/혁신 역량 강화가 필요합니다.',
  '22111': '조직운영과 경영역량 강화가 시급합니다. 체계적 운영시스템 구축과 경영/혁신 역량 확보가 요구됩니다.',
  '21211': '사업활동과 경영역량 강화가 시급합니다. 실행가능한 사업계획 수립과 혁신역량 확보가 요구됩니다.',
  '21111': '전반적인 역량 강화가 시급합니다. 소셜미션 외 사업운영 전반의 체계적 관리와 혁신역량 확보가 필요합니다.',
  '12211': '소셜미션과 경영역량 강화가 시급합니다. 사업활동은 양호하나 지속가능한 성장을 위한 전반적 역량 강화가 필요합니다.',
  '12111': '전반적인 역량 강화가 시급합니다. 사회적 가치 실현을 위한 조직 역량과 경영/혁신 역량 확보가 필요합니다.',
  '11211': '사업활동과 경영역량 강화가 시급합니다. 조직운영은 양호하나 지속가능한 성장을 위한 역량 강화가 필요합니다.',
  '11111': '전 영역의 체계적 역량 강화가 시급합니다. 사회적기업으로서 기본 요건부터 단계적 보완이 필요합니다. (예비)사회적기업 요건을 준수하여 기업 운영 구조를 만들고 지속 가능한 비즈니스 모델을 개발하여 지역 사회와의 상생을 도모함으로써 장기적인 성장 기반을 마련해야 합니다.',
};

// ============================================================
// 심화진단 데이터
// ============================================================

export const ADVANCED_SCORING: Record<string, ScoreComment[]> = {
  q1: [
    { score: 0.5, comment: '해결하고자 하는 사회적문제를 명확히 정의하고' },
    { score: 1, comment: '사회적문제 해결을 위한 구체적 해결 계획을 수립하고' },
    { score: 4, comment: '사회적문제 해결을 위한 목표달성을 위해 세부전략을 마련하고' },
    { score: 5, comment: '사회적문제 해결을 위한 시도의 결과를 분석하며 개선점을 도출하고' },
  ],
  q2: [
    { score: 0.5, comment: '소셜미션을 설정하며' },
    { score: 1, comment: '소셜미션을 구체적으로 수립하며' },
    { score: 2, comment: '수립된 소셜미션을 명문화하고' },
    { score: 3, comment: '소셜미션을 대외적으로 공표하고' },
    { score: 5, comment: '소셜미션을 수행하며' },
  ],
  q3: [
    { score: 0.5, comment: '사업계획 목표와 전략을 명확히 문서화하여 공유해야함' },
    { score: 1, comment: '사업계획을 팀원과 공유하며 주기적으로 검토해야함' },
    { score: 4, comment: '사업계획 내 성과지표 설정과 목표달성 실행 계획수립 권장함' },
    { score: 5, comment: '정기적인 사업성과평가와 피드백을 통해 보완하여야함' },
  ],
  q4: [
    { score: 0.5, comment: '직원들과 정기적회의를 진행하고' },
    { score: 1, comment: '직원들과 정기적회의를 진행하고' },
    { score: 2, comment: '직원들과 정기적회의를 진행하며 관리해야함' },
    { score: 3, comment: '성과관리 회의를 문서화해야함' },
    { score: 5, comment: '성과관리를 잘하고 있으며' },
  ],
  q5: [
    { score: 0.5, comment: '근로자를 위한 재해 위험 요소를 파악하여 안전교육을 실시로' },
    { score: 1, comment: '근로자를 위한 업무재해 위험요소의 대비책 마련으로' },
    { score: 4, comment: '근로자 안전을 위한 체계적인 교육운영 및 시스템을 구축으로' },
    { score: 5, comment: '근로자 안전을 위한 지속적인 교육&훈련을 통해 안전 문화를 정착으로' },
  ],
  q6: [
    { score: 0.8333, comment: '근로자 권리 및 역량향상에 더 많은 노력이 필요함' },
    { score: 0.8333, comment: '근로자 권리 및 역량향상에 대한 노력을 하고 있음' },
    { score: 0.8333, comment: '근로자 권리 및 역량향상에 대한 노력을 충분히 하고 있음' },
  ],
  // q7: 멀티셀렉트 (count × 1.25)
  q7: [
    { score: 1.25, comment: '상품의 차별성을 강조하며 마케팅 전략을 강화해야함' },
    { score: 1.25, comment: '상품 가격 경쟁력을 유지하고 품질보장 방법을 모색해야함' },
    { score: 1.25, comment: '지속적인 취약계층의 고용을 유지하길 권장함' },
    { score: 1.25, comment: '지역 자원의 활용도 증대와 지역 사회와의 협력을 강화해야함' },
  ],
  q8: [
    { score: 0, comment: '사회적경제기업 관련 기업을 조사하며 거래 기회를 찾아' },
    { score: 0.5, comment: '사회적경제기업과 연대기회와 협력사업을 확대하고' },
    { score: 1, comment: '사회적경제기업과 협력사업을 확대하며 지속가능한 관계를 구축하고' },
  ],
  q9: [
    { score: 0.5, comment: '' },
    { score: 1, comment: '' },
    { score: 2, comment: '' },
    { score: 3.5, comment: '' },
  ],
  q10: [
    { score: 0.5, comment: '지역기업과의 거래를 우선하여 지역경제 활성화에 기여해야함' },
    { score: 1, comment: '지역기업과의 구체적인 계획을 수립하며 협력을 강화해야함' },
    { score: 4, comment: '지역거래 기업과의 관계를 지속적으로 발전시키길 권장함' },
    { score: 5, comment: '추가적으로 지역사회에 기여하는 방안을 모색해야함' },
  ],
  q11: [
    { score: 0.5, comment: '' },
    { score: 1, comment: '' },
    { score: 4, comment: '' },
    { score: 5, comment: '' },
  ],
  q12: [
    { score: 0.5, comment: '' },
    { score: 1, comment: '' },
    { score: 4, comment: '' },
    { score: 5, comment: '' },
  ],
  q13: [
    { score: 0.5, comment: '지역사회 기부나 사회공헌사업에 대해 관심을 가질 필요가 있음' },
    { score: 1, comment: '계획한 지역사회 기부나 사회공헌사업을 실천하길 권장함' },
    { score: 4, comment: '지역사회 기부나 사회공헌사업을 정기적으로 확대하길 권장함' },
    { score: 5, comment: '지역사회 기부나 사회공헌사업을 정기적으로 잘 실천하고 있음' },
  ],
  q14: [
    { score: 0.5, comment: '이사회 또는 운영위원회를 조속히 구성하여 운영 방안을 마련하고' },
    { score: 1, comment: '정기적인 회의를 통해 의사결정 과정을 투명하게 운영하고' },
    { score: 2, comment: '최소 반기별 1회를 정기적인 의사결정기구를 운영하고' },
    { score: 3, comment: '의사결정기구 회의결과를 근로자에게 공유해야하고' },
    { score: 5, comment: '근로자들이 회의결과에 대해 의견을 제시할 수 있는 기회를 제공하고' },
  ],
  q15: [
    { score: 0.5, comment: '고용 계획 수립과 인력확보 방안 모색이 필요함' },
    { score: 1, comment: '구체적인 고용 계획 실행방안이 필요함' },
    { score: 2, comment: '고용 계획수립과 인력확보 방안을 모색해야함' },
    { score: 3, comment: '구체적인 고용 계획 수립과 실천노력이 필요함' },
    { score: 4, comment: '지속적인 고용유지와 확대를 위한 노력을 권장함' },
    { score: 5, comment: '향후 인력 관리체계를 수립하길 권장함' },
  ],
  q16: [
    { score: 0.5, comment: '고용확대가 필요함' },
    { score: 1, comment: '유급근로자의 근로조건을 향상시킬 필요있음' },
    { score: 2, comment: '근로자 근로조건은 우수하나 복리후생비, 성과급 등 임금체계에 대한 향상을 권장함' },
    { score: 3, comment: '근로자의 근로조건은 우수하나 성과급 등 임금체계에 대한 향상을 권장함' },
    { score: 4, comment: '유급근로자의 근로조건은 우수함으로 임금체계 수립을 권장함' },
    { score: 5, comment: '임금체계를 수립하여 고용운영을 잘 하고 있음' },
  ],
  q17: [
    { score: 0, comment: '법정의무교육 정보를 찾아서 교육계획을 수립하고' },
    { score: 0.5, comment: '구체적인 법정의무교육계획을 수립하고' },
    { score: 1, comment: '법정의무교육을 실시하며 추가교육 계획을 수립하고' },
    { score: 1.5, comment: '이슈현황을 문서화하여 체계적으로 관리하고' },
  ],
  q18: [
    { score: 0, comment: '대표자가 교육을 적극적으로 찾고 참여해야함' },
    { score: 1, comment: '대표자의 지속적인 학습을 위해 노력해야함' },
    { score: 2, comment: '대표자가 교육내용을 기업에 적용할 수 있도록함' },
    { score: 3.5, comment: '대표자의 교육수료 내용을 구성원들과 공유하길 권장함' },
  ],
  q19: [
    { score: 1, comment: '근로자 역량향상을 위한 교육이 필요함' },
    { score: 2, comment: '근로자 역량향상을 위한 교육이 필요함' },
    { score: 3, comment: '근로자에게 역량향상을 위한 교육 기회를 제공해야함' },
    { score: 4, comment: '근로자의 역량향상을 위한 교육계획 및 실천을 권장함' },
    { score: 5, comment: '근로자 역량향상을 위한 교육을 잘 실천하고 있음' },
  ],
  q20: [
    { score: 0.5, comment: '사업의 내용을 명확히 정의하고,' },
    { score: 1, comment: '상품의 프로토타입 제작과 테스트를 실시하며 개선하고,' },
    { score: 2, comment: '상품의 안정적인 공급망 유지 및 품질관리를 위해 노력하고,' },
    { score: 3, comment: '상품의 품질을 지속적으로 개선하기위해' },
    { score: 4, comment: '상품 유통 경로를 다각화하고' },
    { score: 5, comment: '상품의 수익성을 극대화하기 위해' },
  ],
  q21: [
    { score: 0.5, comment: '지원사업 정보도 관심을 갖기를 권함' },
    { score: 1, comment: '지원사업신청에 집중을 권장함' },
    { score: 4, comment: '지원사업 경험을 바탕으로 지속 가능한 수익모델을 개발해야함' },
    { score: 5, comment: '지원사업 종료 후의 후속사업을 준비해야함' },
  ],
  // q22: 마케팅 계획 (멀티셀렉트 계열 - Excel에서 checked items 합산)
  q22: [
    { score: 0.5, comment: '' },
    { score: 1, comment: '' },
    { score: 4, comment: '' },
    { score: 5, comment: '' },
  ],
  q23: [
    { score: 0.5, comment: '매출창출을 위한 노력이 필요함' },
    { score: 1, comment: '고정매출처를 확대하도록 노력이 필요함' },
    { score: 4, comment: '매출분석을 통해 손익분기점을 확인하도록함' },
    { score: 5, comment: '고정매출로 우수한 경제적성과를 이루고 있음' },
  ],
  // q24~q28: 리커트 1-5
  q24: [
    { score: 1, comment: '실패 사례를 분석하여 새로운 시도의 방향성을 설정하고' },
    { score: 2, comment: '외부 전문가 컨설팅을 통해 전략점검/개선 방안을 모색하고' },
    { score: 3, comment: '새로운 아이디어를 제안하는 시스템을 도입하여 직원들의 참여를 유도하고' },
    { score: 4, comment: '정기적인 내부 교육과 워크숍을 통해 직원들의 역량을 지속적으로 강화하고' },
    { score: 5, comment: '혁신적인 프로젝트를 통해 새로운 시장 진입을 적극적으로 시도하고' },
  ],
  q25: [
    { score: 1, comment: '경쟁사의 성공 사례를 벤치마킹하여 전략을 수립하고' },
    { score: 2, comment: '경쟁사와의 비교 분석을 통해 자사 제품의 차별성을 강조하는 마케팅 전략을 수립하고' },
    { score: 3, comment: '정기적으로 경쟁사 모니터링을 실시하여 시장 변화에 신속하게 대응하고' },
    { score: 4, comment: '정기적으로 경쟁사 모니터링을 실시하여 시장 변화에 신속하게 대응하고' },
    { score: 5, comment: '정기적으로 경쟁사 모니터링을 실시하여 시장 변화에 신속하게 대응하고' },
  ],
  q26: [
    { score: 1, comment: '기술 도입의 필요성을 인식해야함' },
    { score: 2, comment: '소규모 파일럿 프로젝트로 새로운 아이디어를 시도해볼 필요 있음' },
    { score: 3, comment: '업계 트랜드 분석후 적용 가능한 기술을 확인해볼수 있음' },
    { score: 4, comment: '다양한 사례를 공유하고 팀원들과 브레인스토밍을 진행해보길 권함' },
    { score: 5, comment: '지속적인 혁신문화를 조성하고 외부 전문가와 협업을 추진해야함' },
  ],
  q27: [
    { score: 1, comment: '업계 전문가와의 네트워킹 등을 통해 최신 정보를 지속적으로 확보한다' },
    { score: 2, comment: '업계 전문가와의 네트워킹 등을 통해 최신 정보를 지속적으로 확보한다' },
    { score: 3, comment: '기업 내부에서 대외환경 변화에 대한 의견을 수렴하고 논의한다' },
    { score: 4, comment: '점검, 분석결과를 통해 대응방안을 마련한다' },
    { score: 5, comment: '점검, 분석결과를 통해 대응방안을 마련한다' },
  ],
  q28: [
    { score: 1, comment: '목표 시장과 SWOT분석의 중요성을 확인해야함' },
    { score: 2, comment: '시장 조사 자료를 수집하고 SWOT분석을 실시해야함' },
    { score: 3, comment: '분석 결과를 팀과 공유하고 개선 아이디어를 의논해 보길 권장함' },
    { score: 4, comment: '정기적으로 SWOT분석을 업데이트하고 실행계획을 수립해야함' },
    { score: 5, comment: '시장 변화에 맞춰 지속적인 모니터링과 개선 프로세스를 강화해야함' },
  ],
  // q29: 멀티셀렉트 (count × 0.25, 최대 20개 = 5점)
  q29: [],
};

// 심화 q29 코멘트 (점수 구간별)
export const ADVANCED_Q29_COMMENTS: ScoreComment[] = [
  { score: 1, comment: '조직의 성장과 경쟁력 확보를 위해 혁신 노력이 절실히 필요함' },
  { score: 2, comment: '조직의 성장과 경쟁력 확보를 위해 더 많은 혁신 노력이 필요함' },
  { score: 3, comment: '내외부 혁신 노력으로 조직의 성장과 경쟁력 확보를 하도록 해야함' },
  { score: 4, comment: '내외부 혁신 노력이 실질적인 성과로 이어지도록 지속적으로 힘써야함' },
  { score: 5, comment: '내외부 혁신을 위한 노력이 우수함' },
];

// 심화 요인 → 범주 → 관점 구조
export const ADVANCED_FACTORS: FactorDef[] = [
  { name: '소셜미션', category: '조직미션', perspective: '사회적성과', questions: ['q1'], calcType: 'lookup' },
  { name: '소셜미션실천', category: '조직미션', perspective: '사회적성과', questions: ['q2'], calcType: 'lookup' },
  { name: '사업계획수립', category: '조직미션', perspective: '사회적성과', questions: ['q3'], calcType: 'lookup' },
  { name: '성과관리', category: '조직미션', perspective: '사회적성과', questions: ['q4'], calcType: 'lookup' },
  { name: '근로자 보건 및 안전 운영', category: '사업활동', perspective: '사회적성과', questions: ['q5'], calcType: 'lookup' },
  { name: '사회적 가치 실천_근로자 권리', category: '사업활동', perspective: '사회적성과', questions: ['q6'], calcType: 'lookup' },
  { name: '사업의 사회적가치', category: '사업활동', perspective: '사회적성과', questions: ['q7'], calcType: 'multiselect' },
  { name: '사회적경제기업 협력', category: '사업활동', perspective: '사회적성과', questions: ['q8', 'q9'], calcType: 'combined' },
  { name: '지역협력', category: '사업활동', perspective: '사회적성과', questions: ['q10'], calcType: 'lookup' },
  { name: '사회환원계획', category: '사업활동', perspective: '사회적성과', questions: ['q11', 'q12'], calcType: 'average' },
  { name: '사회적이익', category: '사업활동', perspective: '사회적성과', questions: ['q13'], calcType: 'lookup' },
  { name: '민주적 의사결정 구조', category: '조직운영', perspective: '사회적성과', questions: ['q14'], calcType: 'lookup' },
  { name: '고용계획', category: '조직운영', perspective: '사회적성과', questions: ['q15'], calcType: 'lookup' },
  { name: '고용운영', category: '조직운영', perspective: '사회적성과', questions: ['q16'], calcType: 'lookup' },
  { name: '교육참여', category: '조직운영', perspective: '사회적성과', questions: ['q17', 'q18'], calcType: 'sum' },
  { name: '근로자교육', category: '조직운영', perspective: '사회적성과', questions: ['q19'], calcType: 'likert' },
  { name: '비즈니스모델', category: '재정성과', perspective: '경제적성과', questions: ['q20'], calcType: 'lookup' },
  { name: '지원사업참여', category: '재정성과', perspective: '경제적성과', questions: ['q21'], calcType: 'lookup' },
  { name: '마케팅 계획', category: '재정성과', perspective: '경제적성과', questions: ['q22'], calcType: 'lookup' },
  { name: '고정매출', category: '재정성과', perspective: '경제적성과', questions: ['q23'], calcType: 'lookup' },
  { name: '성장잠재력', category: '기업혁신', perspective: '혁신성과', questions: ['q24'], calcType: 'likert' },
  { name: '아이템경쟁력', category: '기업혁신', perspective: '혁신성과', questions: ['q25'], calcType: 'likert' },
  { name: '아이템검증', category: '기업혁신', perspective: '혁신성과', questions: ['q26'], calcType: 'likert' },
  { name: '시장분석계획', category: '기업혁신', perspective: '혁신성과', questions: ['q27'], calcType: 'likert' },
  { name: '시장분석실천', category: '기업혁신', perspective: '혁신성과', questions: ['q28'], calcType: 'likert' },
  { name: '혁신노력', category: '기업혁신', perspective: '혁신성과', questions: ['q29'], calcType: 'multiselect' },
];

// 심화 그래프 요인 (15개)
export const ADVANCED_GRAPH_FACTORS: GraphFactorDef[] = [
  { group: '조직미션', name: '소셜미션' },
  { group: '조직미션', name: '사업계획수립' },
  { group: '사업활동', name: '기업의 사회적가치' },
  { group: '사업활동', name: '사회적경제기업 협력' },
  { group: '사업활동', name: '지역협력' },
  { group: '사업활동', name: '사회환원' },
  { group: '조직운영', name: '민주적 의사결정 구조' },
  { group: '조직운영', name: '고용' },
  { group: '조직운영', name: '내부역량향상' },
  { group: '재정성과', name: '비즈니스모델' },
  { group: '재정성과', name: '경제적성과' },
  { group: '기업혁신', name: '성장잠재력' },
  { group: '기업혁신', name: '사업아이템' },
  { group: '기업혁신', name: '시장분석계획' },
  { group: '기업혁신', name: '혁신노력' },
];

// 심화 32개 Code → 코멘트 매핑
export const ADVANCED_CODE_COMMENTS: Record<string, string> = {
  '22222': '전 영역이 고르게 우수합니다. 현재의 균형잡힌 발전 전략을 지속하면서, 사회적 가치와 경제적 성과의 시너지를 더욱 강화하시기 바랍니다. 타기업과의 협업을 증진시키고 성과 공유를 통해 기업 전체의 목표를 통합적으로 달성할 수 있는 환경을 조성해야 합니다. 또한 정기적인 성과 평가를 통해 지속 가능한 발전을 도모하고 사회적 책임을 다하는 기업으로 나아가야 합니다.',
  '22122': '조직운영 체계 보완이 필요합니다. 근로자 권익보호와 민주적 의사결정 구조 강화를 통해 사회적 가치 실현의 완성도를 높이시기 바랍니다.',
  '21222': '사업활동 영역 강화가 필요합니다. 사회적 가치 창출을 위한 구체적 사업계획 수립과 실행방안 모색이 요구됩니다.',
  '21122': '사업활동과 조직운영이 취약합니다. 사회적 미션은 명확하나 이를 실현하기 위한 구체적 실행체계 구축이 시급합니다.',
  '12222': '소셜미션 구체화가 필요합니다. 사업성과는 우수하나, 해결하고자 하는 사회문제와 그 해결방안을 더욱 명확히 하시기 바랍니다.',
  '12122': '조직 미션과 운영체계 보완이 필요합니다. 사업성과는 우수하나 사회적 가치 지향성 강화와 내부 운영시스템 개선이 요구됩니다.',
  '11222': '소셜미션 구체화와 사업활동 보완이 필요합니다. 경제적 성과는 우수하나 사회적 가치 창출 방안을 구체화하시기 바랍니다.',
  '11122': '사회적 가치 영역 전반의 보완이 필요합니다. 경제적 및 혁신 성과는 우수하나 사회적기업으로서의 기본 요건 강화가 시급합니다.',
  '22221': '혁신성과 제고가 필요합니다. 사회적·경제적 성과는 우수하나 지속가능한 성장을 위한 혁신 노력 강화가 요구됩니다.',
  '22121': '조직운영과 혁신성과 개선이 필요합니다. 시장환경 변화에 대응할 수 있는 조직체계 구축과 혁신역량 강화가 요구됩니다.',
  '21221': '사업활동과 혁신성과 개선이 필요합니다. 사회가치 실현을 위한 사업모델 혁신과 새로운 시도가 요구됩니다.',
  '21121': '사업운영 전반의 혁신이 필요합니다. 소셜미션 실현을 위한 조직운영 체계 개선과 혁신적 사업방식 도입이 요구됩니다.',
  '12221': '미션 구체화와 혁신역량 강화가 필요합니다. 안정적 사업기반 위에 사회적 가치 창출을 위한 혁신적 접근이 요구됩니다.',
  '12121': '조직 미션·운영과 혁신역량 강화가 필요합니다. 경제적 성과를 사회적 가치로 연계하는 혁신적 방안 모색이 요구됩니다.',
  '11221': '사회적가치 창출 기반 강화가 필요합니다. 조직운영은 양호하나 사회적 미션 구체화와 혁신적 사업방식 도입이 요구됩니다.',
  '11121': '사회적 가치 영역 전반의 혁신이 필요합니다. 경제적 성과를 사회적 가치로 전환하는 혁신적 사업모델 구축이 시급합니다.',
  '22212': '경제적 성과 제고가 필요합니다. 사회적 가치 실현 기반은 우수하나 수익모델 강화와 시장 확대가 요구됩니다.',
  '22112': '조직운영과 경제적 성과 개선이 필요합니다. 혁신역량을 경제적 성과로 연계하는 사업전략 수립이 요구됩니다.',
  '21212': '사업활동과 경제적 성과 개선이 필요합니다. 혁신적 시도를 실질적 매출성과로 연계하는 방안 모색이 시급합니다.',
  '21112': '사업운영과 경제성과 개선이 필요합니다. 혁신역량을 활용한 수익모델 구체화와 시장 확대 전략 수립이 요구됩니다.',
  '12212': '소셜미션 구체화와 경제적 성과 개선이 필요합니다. 혁신역량을 활용한 안정적 수익구조 확보가 시급합니다.',
  '12112': '조직 미션·운영 체계와 경제적 성과 개선이 필요합니다. 혁신역량의 경제적 성과 연계가 요구됩니다.',
  '11212': '사업활동 강화와 경제적 성과 개선이 필요합니다. 혁신역량을 활용한 실질적 매출 증대 방안 수립이 시급합니다.',
  '11112': '사회적 가치 기반 강화와 경제적 성과 개선이 필요합니다. 혁신역량을 활용한 수익모델 확립이 시급합니다.',
  '22211': '경영역량 강화가 시급합니다. 사회적 가치 기반은 우수하나 지속가능성 확보를 위한 경영/혁신 역량 강화가 필요합니다.',
  '22111': '조직운영과 경영역량 강화가 시급합니다. 체계적 운영시스템 구축과 경영/혁신 역량 확보가 요구됩니다.',
  '21211': '사업활동과 경영역량 강화가 시급합니다. 실행가능한 사업계획 수립과 혁신역량 확보가 요구됩니다.',
  '21111': '전반적인 역량 강화가 시급합니다. 소셜미션 외 사업운영 전반의 체계적 관리와 혁신역량 확보가 필요합니다.',
  '12211': '소셜미션과 경영역량 강화가 시급합니다. 사업활동은 양호하나 지속가능한 성장을 위한 전반적 역량 강화가 필요합니다.',
  '12111': '전반적인 역량 강화가 시급합니다. 사회적 가치 실현을 위한 조직 역량과 경영/혁신 역량 확보가 필요합니다.',
  '11211': '사업활동과 경영역량 강화가 시급합니다. 조직운영은 양호하나 지속가능한 성장을 위한 역량 강화가 필요합니다.',
  '11111': '전 영역의 체계적 역량 강화가 시급합니다. 사회적기업으로서 기본 요건부터 단계적 보완이 필요합니다. (예비)사회적기업 요건을 준수하여 기업 운영 구조를 만들고 지속 가능한 비즈니스 모델을 개발하여 지역 사회와의 상생을 도모함으로써 장기적인 성장 기반을 마련해야 합니다.',
};

// ============================================================
// 점수 산출 함수
// ============================================================

export interface FactorScore {
  name: string;
  category: string;
  perspective: string;
  score: number;
  comment: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  factorScores: FactorScore[];
}

export interface PerspectiveScore {
  name: string;
  score: number;
}

export interface ScoringResult {
  factorScores: FactorScore[];
  categoryScores: CategoryScore[];
  perspectiveScores: PerspectiveScore[];
  code: string;
  codeComment: string;
  graphFactorScores: { group: string; name: string; score: number }[];
}

// 문항 점수 산출 (STEP 1)
function getQuestionScore(
  qKey: string,
  answer: any,
  scoringTable: Record<string, ScoreComment[]>,
  surveyType: SurveyType
): { score: number; comment: string } {
  const table = scoringTable[qKey];
  if (!table || table.length === 0) return { score: 0, comment: '' };

  // 멀티셀렉트 문항: q4(기초), q7(심화) - 4옵션, per_item=1.25
  if (
    (surveyType === 'basic-svi' && qKey === 'q4') ||
    (surveyType === 'advanced-svi' && qKey === 'q7')
  ) {
    const count = Array.isArray(answer) ? answer.length : 0;
    const score = count * 1.25;
    const idx = Math.min(count, table.length) - 1;
    const comment = idx >= 0 ? table[idx].comment : '';
    return { score: Math.min(score, 5), comment };
  }

  // 멀티셀렉트 문항: q6(심화) - 6옵션, per_item=5/6
  if (surveyType === 'advanced-svi' && qKey === 'q6') {
    const count = Array.isArray(answer) ? answer.length : 0;
    const score = count * (5 / 6);
    const idx = Math.min(count, table.length) - 1;
    const comment = idx >= 0 ? table[idx].comment : '';
    return { score: Math.min(score, 5), comment };
  }

  // 멀티셀렉트 문항: q22(심화) - 6옵션, per_item=5/6
  if (surveyType === 'advanced-svi' && qKey === 'q22') {
    const count = Array.isArray(answer) ? answer.length : 0;
    const score = count * (5 / 6);
    const idx = Math.min(count, table.length) - 1;
    const comment = idx >= 0 ? table[idx].comment : '';
    return { score: Math.min(score, 5), comment };
  }

  // 멀티셀렉트 문항: q29(심화) - 20옵션, per_item=0.25
  if (surveyType === 'advanced-svi' && qKey === 'q29') {
    const count = Array.isArray(answer) ? answer.length : 0;
    const score = count * 0.25;
    return { score: Math.min(score, 5), comment: '' };
  }

  // 리커트 (1-5): 기초 q16-q18, 심화 q19, q24-q28
  const likertQuestions = surveyType === 'basic-svi'
    ? ['q16', 'q17', 'q18']
    : ['q19', 'q24', 'q25', 'q26', 'q27', 'q28'];

  if (likertQuestions.includes(qKey)) {
    const val = typeof answer === 'number' ? answer : parseInt(answer) || 0;
    const entry = table.find(t => t.score === val);
    return entry || { score: val, comment: '' };
  }

  // 일반 lookup: 응답값(1-based) → table[value-1]
  const idx = (typeof answer === 'number' ? answer : parseInt(answer)) - 1;
  if (isNaN(idx) || idx < 0 || idx >= table.length) {
    return { score: 0, comment: '' };
  }
  return { score: table[idx].score, comment: table[idx].comment };
}

// 요인 점수 산출 (STEP 2)
function calculateFactorScore(
  factor: FactorDef,
  responses: Record<string, any>,
  scoringTable: Record<string, ScoreComment[]>,
  surveyType: SurveyType
): FactorScore {
  const qScores = factor.questions.map(q =>
    getQuestionScore(q, responses[q], scoringTable, surveyType)
  );

  let score = 0;
  let comment = '';

  switch (factor.calcType) {
    case 'lookup':
    case 'likert':
      score = qScores[0]?.score ?? 0;
      comment = qScores[0]?.comment ?? '';
      break;
    case 'multiselect':
      score = qScores[0]?.score ?? 0;
      comment = qScores[0]?.comment ?? '';
      break;
    case 'sum':
      score = qScores.reduce((acc, q) => acc + q.score, 0);
      comment = qScores.map(q => q.comment).filter(Boolean).join(' ');
      break;
    case 'average':
      score = qScores.reduce((acc, q) => acc + q.score, 0) / qScores.length;
      comment = qScores.map(q => q.comment).filter(Boolean).join(' ');
      break;
    case 'combined':
      // q8 + q9 합산 (심화 사회적경제기업 협력)
      score = qScores.reduce((acc, q) => acc + q.score, 0);
      comment = qScores.map(q => q.comment).filter(Boolean).join(' ');
      break;
  }

  return {
    name: factor.name,
    category: factor.category,
    perspective: factor.perspective,
    score,
    comment,
  };
}

// 범주 점수 산출 (STEP 3)
function calculateCategoryScores(factorScores: FactorScore[]): CategoryScore[] {
  const categories = CATEGORIES.map(catName => {
    const factors = factorScores.filter(f => f.category === catName);
    const avg = factors.length > 0
      ? factors.reduce((acc, f) => acc + f.score, 0) / factors.length
      : 0;
    return {
      name: catName,
      score: avg,
      factorScores: factors,
    };
  });
  return categories;
}

// 관점 점수 산출 (STEP 4)
function calculatePerspectiveScores(categoryScores: CategoryScore[]): PerspectiveScore[] {
  const catMap = Object.fromEntries(categoryScores.map(c => [c.name, c.score]));

  // 사회적성과 = AVG(조직미션, 사업활동, 조직운영)
  const social = (catMap['조직미션'] + catMap['사업활동'] + catMap['조직운영']) / 3;
  // 경제적성과 = 재정성과
  const economic = catMap['재정성과'];
  // 혁신성과 = 기업혁신
  const innovation = catMap['기업혁신'];

  return [
    { name: '사회적성과', score: social },
    { name: '경제적성과', score: economic },
    { name: '혁신성과', score: innovation },
  ];
}

// 5자리 Code 생성 (STEP 5)
function generateCode(categoryScores: CategoryScore[]): string {
  return CATEGORIES.map(catName => {
    const catScore = categoryScores.find(c => c.name === catName);
    const threshold = CODE_THRESHOLDS.find(t => t.category === catName);
    if (!catScore || !threshold) return '1';
    return catScore.score >= threshold.threshold ? '2' : '1';
  }).join('');
}

// 그래프 요인 점수
// nameMap에 정의된 그래프 요인은 복수 요인의 평균값으로 표시
function calculateGraphFactorScores(
  factorScores: FactorScore[],
  graphFactors: GraphFactorDef[]
): { group: string; name: string; score: number }[] {
  // 그래프 요인 → 실제 요인명 매핑 (복수 요인 집계용)
  const nameMap: Record<string, string[]> = {
    '기업의 사회적가치': ['기업의 사회적가치', '사회적가치(다중)', '근로자 보건 및 안전 운영', '사회적 가치 실천_근로자 권리', '사업의 사회적가치'],
    '사회환원': ['사회환원', '사회환원계획', '사회적이익'],
    '고용': ['고용', '고용계획', '고용운영'],
    '내부역량향상': ['내부역량향상', '교육참여', '근로자교육'],
    '사업아이템': ['사업아이템', '아이템경쟁력', '아이템검증'],
    '경제적성과': ['경제적성과', '고정매출'],
    '소셜미션': ['소셜미션', '소셜미션실천'],
    '사업계획수립': ['성과관리체계', '사업계획수립', '성과관리'],
  };

  return graphFactors.map(gf => {
    // nameMap 집계를 우선 적용 (복수 요인 평균)
    const matchNames = nameMap[gf.name];
    if (matchNames) {
      const related = factorScores.filter(f => matchNames.includes(f.name));
      if (related.length > 0) {
        const avg = related.reduce((acc, f) => acc + f.score, 0) / related.length;
        return { group: gf.group, name: gf.name, score: avg };
      }
    }

    // 직접 매칭 (단일 요인)
    const matched = factorScores.find(f => f.name === gf.name);
    return {
      group: gf.group,
      name: gf.name,
      score: matched?.score ?? 0,
    };
  });
}

// q29 코멘트 lookup
function getQ29Comment(score: number): string {
  if (score <= 1) return ADVANCED_Q29_COMMENTS[0].comment;
  if (score <= 2) return ADVANCED_Q29_COMMENTS[1].comment;
  if (score <= 3) return ADVANCED_Q29_COMMENTS[2].comment;
  if (score <= 4) return ADVANCED_Q29_COMMENTS[3].comment;
  return ADVANCED_Q29_COMMENTS[4].comment;
}

// ============================================================
// 메인 점수 산출 함수
// ============================================================
export function calculateSVIScores(
  responses: Record<string, any>,
  surveyType: SurveyType
): ScoringResult {
  const isBasic = surveyType === 'basic-svi';
  const scoringTable = isBasic ? BASIC_SCORING : ADVANCED_SCORING;
  const factors = isBasic ? BASIC_FACTORS : ADVANCED_FACTORS;
  const graphFactors = isBasic ? BASIC_GRAPH_FACTORS : ADVANCED_GRAPH_FACTORS;
  const codeComments = isBasic ? BASIC_CODE_COMMENTS : ADVANCED_CODE_COMMENTS;

  // STEP 1+2: 요인 점수
  const factorScores = factors.map(f =>
    calculateFactorScore(f, responses, scoringTable, surveyType)
  );

  // 심화 q29 코멘트 보정
  if (!isBasic) {
    const q29Factor = factorScores.find(f => f.name === '혁신노력');
    if (q29Factor) {
      q29Factor.comment = getQ29Comment(q29Factor.score);
    }
  }

  // STEP 3: 범주 점수
  const categoryScores = calculateCategoryScores(factorScores);

  // STEP 4: 관점 점수
  const perspectiveScores = calculatePerspectiveScores(categoryScores);

  // STEP 5: Code 생성
  const code = generateCode(categoryScores);

  // STEP 6: Code 코멘트
  const codeComment = codeComments[code] || '진단 결과에 대한 종합 분석이 필요합니다.';

  // 그래프 요인 점수
  const graphFactorScores = calculateGraphFactorScores(factorScores, graphFactors);

  return {
    factorScores,
    categoryScores,
    perspectiveScores,
    code,
    codeComment,
    graphFactorScores,
  };
}
