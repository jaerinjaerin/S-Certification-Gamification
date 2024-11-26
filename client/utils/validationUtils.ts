export const isValidCampaignQuizSetId = (value: string): boolean => {
  const regex = /^[a-zA-Z0-9]+(_[a-zA-Z0-9]+){2,}$/;
  return regex.test(value);
};

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const regex = /^\+?[1-9]\d{1,14}$/; // 국제 전화번호 포맷
  return regex.test(phone);
};

export const areArraysEqualUnordered = (
  arr1: string[],
  arr2: string[]
): boolean => {
  // 배열의 길이가 다르면 바로 false 반환
  if (arr1.length !== arr2.length) {
    return false;
  }

  // 배열을 정렬 후 비교
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  return sortedArr1.every((value, index) => value === sortedArr2[index]);
};
