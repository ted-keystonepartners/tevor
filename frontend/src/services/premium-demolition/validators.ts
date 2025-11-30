// 입력값 검증 유틸리티

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface QuoteFormData {
  demolitionType: string;
  area: string;
  location: string;
  desiredDate: string;
  contact: string;
}

// 전화번호 정규식
const PHONE_REGEX = /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/;

// 위험한 문자 패턴 (XSS, SQL Injection 방지)
const DANGEROUS_PATTERN = /[<>'"`;]/g;

// HTML 이스케이프
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

// 입력값 정제
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(DANGEROUS_PATTERN, '');
};

// 견적 폼 검증
export const validateQuoteForm = (data: QuoteFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // 철거 유형 검증
  const validTypes = ['주택 철거', '상가 철거', '인테리어 철거', '부분 철거', '기타'];
  if (!data.demolitionType) {
    errors.demolitionType = '철거 유형을 선택해주세요.';
  } else if (!validTypes.includes(data.demolitionType)) {
    errors.demolitionType = '올바른 철거 유형을 선택해주세요.';
  }
  
  // 면적 검증
  if (!data.area) {
    errors.area = '면적을 입력해주세요.';
  } else {
    const areaNum = parseFloat(data.area);
    if (isNaN(areaNum) || areaNum <= 0) {
      errors.area = '올바른 면적을 입력해주세요. (양수)';
    } else if (areaNum > 10000) {
      errors.area = '면적이 너무 큽니다. (최대 10,000㎡)';
    }
  }
  
  // 위치 검증
  if (!data.location) {
    errors.location = '위치를 입력해주세요.';
  } else if (data.location.length < 2) {
    errors.location = '위치를 2자 이상 입력해주세요.';
  } else if (data.location.length > 100) {
    errors.location = '위치가 너무 깁니다. (최대 100자)';
  } else if (DANGEROUS_PATTERN.test(data.location)) {
    errors.location = '위치에 특수문자는 사용할 수 없습니다.';
  }
  
  // 희망 일정 검증 (선택사항)
  if (data.desiredDate) {
    const selectedDate = new Date(data.desiredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(selectedDate.getTime())) {
      errors.desiredDate = '올바른 날짜를 선택해주세요.';
    } else if (selectedDate < today) {
      errors.desiredDate = '과거 날짜는 선택할 수 없습니다.';
    } else {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (selectedDate > maxDate) {
        errors.desiredDate = '1년 이내의 날짜를 선택해주세요.';
      }
    }
  }
  
  // 연락처 검증 (선택사항)
  if (data.contact) {
    const cleanContact = data.contact.replace(/-/g, '');
    
    if (!PHONE_REGEX.test(data.contact)) {
      errors.contact = '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)';
    } else if (cleanContact.length < 10 || cleanContact.length > 11) {
      errors.contact = '휴대폰 번호를 확인해주세요.';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 정제된 데이터 생성
export const sanitizeQuoteData = (data: QuoteFormData): QuoteFormData => {
  return {
    demolitionType: data.demolitionType, // 선택값이므로 정제 불필요
    area: sanitizeInput(data.area),
    location: sanitizeInput(data.location),
    desiredDate: data.desiredDate, // 날짜는 정제 불필요
    contact: data.contact.replace(/[^0-9-]/g, '') // 숫자와 하이픈만 허용
  };
};