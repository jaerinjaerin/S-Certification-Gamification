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
