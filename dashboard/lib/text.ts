export function formatCamelCaseToTitleCase(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, " $1") // 대문자 앞에 공백 추가
    .replace(/^./, (str) => str.toUpperCase()) // 첫 문자를 대문자로 변경
    .trim(); // 앞뒤 공백 제거
}
