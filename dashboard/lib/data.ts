/* eslint-disable @typescript-eslint/no-explicit-any */
// userId 확인 후 중복 제거, quizStageIndex값이 높으면 업데이트
export function removeDuplicateUsers(users: Record<string, any>[]) {
  return Object.values(
    users.reduce(
      (acc, user: any) => {
        if (
          !acc[user.userId] ||
          acc[user.userId].quizStageIndex < user.quizStageIndex
        ) {
          acc[user.userId] = user;
        }
        return acc;
      },
      {} as Record<string, any>[]
    )
  );
}
