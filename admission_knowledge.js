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
  admission_2026: {
    quota: "남학생 10개 학급, 총 300명",
    schedule: {
      application_start: "2025. 12. 11.(목)",
      application_end: "2025. 12. 15.(월) 15:40",
      announcement: "2025. 12. 26.(금) 10:00",
      registration_period: "2025. 12. 29.(월) ~ 12. 30.(화) 16:00"
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
    new_student_selection: {
      criteria: "중학교 3년간 내신 성적 우수자 및 사회적 배려대상자",
      local_cutoff: "진해 관내(용원, 웅동, 웅천 제외): 내신 5% 이내 우선 선발",
      outside_cutoff: "진해 관외(용원 포함): 내신 30% 이내 우선 선발"
    }
  },
  scholarships: {
    annual_amount: "약 1억원 규모 (향후 20년간 유지 계획)",
    types: [
      "진해고 총동창회 장학금 (성적 우수 16명)",
      "애향삼품 장학금",
      "창원한마음병원 장학금",
      "안주환 장학금",
      "진해인재육성 장학재단"
    ]
  },
  university_results_2025: {
    key_highlights: [
      "서울대 3명",
      "의예과 16명",
      "연세대/고려대 8명",
      "의치한약수 합계 20명 이상",
      "부산대/경북대 등 국립대 다수"
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
