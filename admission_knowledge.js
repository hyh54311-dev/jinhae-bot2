/**
 * 진해고등학교 2026학년도 입학 상담 지식 베이스 (정제본)
 */

const ADMISSION_KNOWLEDGE = {
  school_info: {
    name: "진해고등학교",
    type: "기숙형 자율학교 (비평준화 일반고)",
    location: "경상남도 창원시 진해구 여좌로 100",
    phone_admin: "055-546-2361",
    phone_office: "055-546-2260",
    homepage: "http://jinhae-h.gne.go.kr"
  },
  admission_2027: {
    quota: "보통과 남학생 10개 학급, 총 300명 (정원 내 300명, 정원 외 교육지원 9명, 특례입학 9명 이내)",
    schedule: {
      application_start: "2026. 12. 10.(목) 10:00",
      application_end: "2026. 12. 14.(월) 14:00",
      announcement: "2026. 12. 30.(수) 10:00",
      registration_period: "2027. 1. 4.(월) 16:30까지 (등록확인서 제출)"
    },
    qualifications: [
      "경상남도 소재 중학교 졸업(예정)자",
      "전 가족이 경상남도에 거주하는 타 시·도 중학교 졸업자",
      "검정고시 합격자 (경남 거주자)"
    ],
    selection_method: "중학교 내신 성적(석차백분율) 100% 반영"
  },
  dormitory: {
    names: ["송학관 (36명)", "동백관 (117명)"],
    total_capacity: 153,
    assignments: {
      dongbaek: "1학년 전체, 2학년 전체, 3학년 일부 학생 배정 (1,2학년은 1실 3인 생활, 3학년은 1실 2인 생활)",
      songhak: "3학년 학생 배정 (1실 2인 생활)"
    },
    new_student_selection: {
      criteria: "중학교 3년간 내신 성적 우수자 및 사회적 배려대상자",
      local_cutoff: "진해 관내(용원, 웅동, 웅천 제외): 내신 5% 이내 우선 선발",
      outside_cutoff: "진해 관외(구 창원, 구 마산, 김해 등과 진해지역 중 용원, 웅천 포함) 학생: 내신 30% 이내 우선 선발"
    }
  },
  scholarships: {
    annual_amount: "약 1억원 규모 (향후 20년간 유지 계획)",
    payment_method: "제출한 통장 또는 스쿨뱅킹 계좌로 지급 (일부 장학금에 한해 문화상품권으로 지급)",
    types: [
      "진해고 총동창회 장학금 (성적 우수 16명)",
      "애향삼품 장학금",
      "창원한마음병원 장학금",
      "안주환 장학금",
      "진해인재육성 장학재단"
    ]
  },
  university_results_2026: {
    key_highlights: [
      "서울대 1명",
      "의예과 3명",
      "한의대·약대·수의대 1명",
      "연세대 2명, 고려대 2명",
      "서강대 3명, 성균관대 4명, 한양대 4명",
      "해군사관학교 6명, 육군사관학교 1명",
      "부산대 17명, 경북대 12명",
      "부경대·경상국립대·창원대 57명"
    ]
  },
  special_programs: [
    "진해인재스쿨 (우수 강사진 초빙 수업)",
    "AI(인공지능) 및 4차 산업혁명 통합 교육",
    "학교장 삼품제(知性, 人性, 勇性)",
    "기숙사 특색 프로그램 및 멘토링"
  ]
};

if (typeof module !== 'undefined') {
  module.exports = ADMISSION_KNOWLEDGE;
}
