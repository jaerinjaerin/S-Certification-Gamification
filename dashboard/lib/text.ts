export function formatCamelCaseToTitleCase(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, ' $1') // 대문자 앞에 공백 추가
    .replace(/^./, (str) => str.toUpperCase()) // 첫 문자를 대문자로 변경
    .trim(); // 앞뒤 공백 제거
}

export const formatSnakeToTitleCase = (value: string) => {
  return value
    .toLowerCase() // 모든 문자를 소문자로 변환
    .replace(/_/g, ' ') // 언더스코어를 공백으로 대체
    .replace(/\b\w/g, (char) => char.toUpperCase()); // 각 단어의 첫 글자를 대문자로 변환
};

// code 추출 최대 5개까지 허용
export function extractLanguageCode(filename: string): string | null {
  const match = filename.match(/_(\w{2}(?:-\w{2,3}){0,4})\./); // 최대 5개까지 허용
  return match ? match[1] : null;
}

export function capitalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
