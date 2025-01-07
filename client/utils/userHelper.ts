export const hasSavedDetails = (user: { jobId: any } | null): boolean => {
  if (!user) return false; // 유저 객체가 없으면 디테일이 저장되지 않은 것으로 간주
  return user.jobId !== null; // jobId가 null이 아니면 디테일이 저장된 것으로 간주
};
