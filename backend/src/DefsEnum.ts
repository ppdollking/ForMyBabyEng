export enum USER_ROLE {
  PARENT = 'parent',
  CHILD = 'child',
}

export enum TEST_TYPE {
  BLANK = 'blank',       // 빈칸 채우기
  MEANING = 'meaning',   // 뜻↔단어 매칭
}

export enum MEANING_TEST_MODE {
  MEANING_TO_WORD = 'meaning_to_word', // 뜻 → 영어단어 입력
  WORD_TO_MEANING = 'word_to_meaning', // 영어단어 → 뜻 입력
}

// 응답 상태 코드
export const STATUS_SUCC = 200;
export const STATUS_BAD_REQUEST = 400;
export const STATUS_UNAUTHORIZED = 401;
export const STATUS_FORBIDDEN = 403;
export const STATUS_NOT_FOUND = 404;
export const STATUS_SERVER_ERROR = 500;

// 커스텀 비즈니스 에러 코드
export const ERR_USER_NOT_FOUND = 100001;
export const ERR_USER_DUPLICATE = 100002;
export const ERR_INVALID_PASSWORD = 100003;
export const ERR_INVALID_ROLE = 100004;
export const ERR_LIST_NOT_FOUND = 100010;
export const ERR_WORD_NOT_FOUND = 100011;
export const ERR_WORD_DUPLICATE = 100012;
export const ERR_TEST_NOT_FOUND = 100020;
export const ERR_NOT_CHILD_OF_PARENT = 100030;

// 포인트
export const POINT_PERFECT_SCORE = 10; // 100점 시 지급 포인트
