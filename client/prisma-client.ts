import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// // Middleware to synchronize data
// prisma.$use(async (params, next) => {
//   let result = await next(params);

//   // Handle UserQuizLog -> UserQuizStatistics
//   if (
//     params.model === "UserQuizLog" &&
//     (params.action === "create" || params.action === "update")
//   ) {
//     const data = params.args.data;

//     // Synchronize with UserQuizStatistics
//     await prisma.userQuizStatistics.upsert({
//       where: {
//         userId_campaignId: {
//           userId: data.userId,
//           campaignId: data.campaignId,
//         },
//       },
//       update: {
//         elapsedSeconds: { increment: data.elapsedSeconds || 0 },
//         score: { increment: data.score || 0 },
//         isCompleted: data.isCompleted ?? undefined,
//         isBadgeAcquired: data.isBadgeAcquired ?? undefined,
//         lastCompletedStage: data.lastCompletedStage ?? undefined,
//         updatedAt: new Date(),
//       },
//       create: {
//         userId: data.userId,
//         campaignId: data.campaignId,
//         quizSetId: data.quizSetId,
//         elapsedSeconds: data.elapsedSeconds || 0,
//         score: data.score || 0,
//         isCompleted: data.isCompleted,
//         isBadgeAcquired: data.isBadgeAcquired,
//         lastCompletedStage: data.lastCompletedStage,
//         authType: data.authType,
//         quizSetPath: data.quizSetPath,
//         domainId: data.domainId,
//         languageId: data.languageId,
//         jobId: data.jobId,
//         regionId: data.regionId,
//         subsidiaryId: data.subsidiaryId,
//         storeId: data.storeId,
//         storeSegmentText: data.storeSegmentText,
//         channelId: data.channelId,
//         channelSegmentId: data.channelSegmentId,
//         channelName: data.channelName,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     });
//   }

//   // Handle UserQuizBadgeStageLog -> UserQuizBadgeStageStatistics
//   if (
//     params.model === "UserQuizBadgeStageLog" &&
//     (params.action === "create" || params.action === "update")
//   ) {
//     const data = params.args.data;

//     // Synchronize with UserQuizBadgeStageStatistics
//     await prisma.userQuizBadgeStageStatistics.upsert({
//       where: {
//         userId_campaignId_quizStageId: {
//           userId: data.userId,
//           campaignId: data.campaignId,
//           quizStageId: data.quizStageId,
//         },
//       },
//       update: {
//         elapsedSeconds: { increment: data.elapsedSeconds || 0 },
//         score: { increment: data.score || 0 },
//         isBadgeAcquired: data.isBadgeAcquired ?? undefined,
//         updatedAt: new Date(),
//       },
//       create: {
//         userId: data.userId,
//         authType: data.authType,
//         campaignId: data.campaignId,
//         quizSetId: data.quizSetId,
//         quizStageId: data.quizStageId,
//         quizStageIndex: data.quizStageIndex,
//         elapsedSeconds: data.elapsedSeconds || 0,
//         score: data.score || 0,
//         isBadgeAcquired: data.isBadgeAcquired,
//         badgeActivityId: data.badgeActivityId,
//         domainId: data.domainId,
//         languageId: data.languageId,
//         jobId: data.jobId,
//         regionId: data.regionId,
//         subsidiaryId: data.subsidiaryId,
//         storeId: data.storeId,
//         storeSegmentText: data.storeSegmentText,
//         channelId: data.channelId,
//         channelSegmentId: data.channelSegmentId,
//         channelName: data.channelName,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     });
//   }

//   // Handle UserQuizStageLog -> UserQuizStageStatistics
//   if (
//     params.model === "UserQuizStageLog" &&
//     (params.action === "create" || params.action === "update")
//   ) {
//     const data = params.args.data;

//     // Synchronize with UserQuizStageStatistics
//     await prisma.userQuizStageStatistics.upsert({
//       where: {
//         userId_campaignId_quizStageId: {
//           userId: data.userId,
//           campaignId: data.campaignId,
//           quizStageId: data.quizStageId,
//         },
//       },
//       update: {
//         elapsedSeconds: { increment: data.elapsedSeconds || 0 },
//         score: { increment: data.score || 0 },
//         isBadgeAcquired: data.isBadgeAcquired ?? undefined,
//         updatedAt: new Date(),
//       },
//       create: {
//         userId: data.userId,
//         authType: data.authType,
//         campaignId: data.campaignId,
//         quizSetId: data.quizSetId,
//         quizStageId: data.quizStageId,
//         quizStageIndex: data.quizStageIndex,
//         elapsedSeconds: data.elapsedSeconds || 0,
//         score: data.score || 0,
//         isBadgeAcquired: data.isBadgeAcquired,
//         badgeActivityId: data.badgeActivityId,
//         remainingHearts: data.remainingHearts,
//         percentile: data.percentile,
//         scoreRange: data.scoreRange,
//         domainId: data.domainId,
//         languageId: data.languageId,
//         jobId: data.jobId,
//         regionId: data.regionId,
//         subsidiaryId: data.subsidiaryId,
//         storeId: data.storeId,
//         storeSegmentText: data.storeSegmentText,
//         channelId: data.channelId,
//         channelSegmentId: data.channelSegmentId,
//         channelName: data.channelName,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     });
//   }

//   // Handle UserQuizQuestionLog -> UserQuizQuestionStatistics
//   if (params.model === "UserQuizQuestionLog" && params.action === "create") {
//     const data = params.args.data as UserQuizLog;

//     // Synchronize with UserQuizQuestionStatistics
//     await prisma.userQuizQuestionStatistics.create({
//       userId: data.userId,
//       quizSetId: data.quizSetId,
//       questionId: data.questionId,
//       isCorrect: data.isCorrect,
//       elapsedSeconds: data.elapsedSeconds || 0,
//       authType: data.authType,
//       questionText: data.questionText,
//       selectedOptionIds: data.selectedOptionIds,
//       correctOptionIds: data.correctOptionIds,
//       quizStageId: data.quizStageId,
//       quizStageIndex: data.quizStageIndex,
//       questionType: data.questionType,
//       category: data.category,
//       product: data.product,
//       specificFeature: data.specificFeature,
//       importance: data.importance,
//       campaignId: data.campaignId,
//       jobId: data.jobId,
//       languageId: data.languageId,
//       domainId: data.domainId,
//       regionId: data.regionId,
//       subsidiaryId: data.subsidiaryId,
//       storeId: data.storeId,
//       storeSegmentText: data.storeSegmentText,
//       channelId: data.channelId,
//       channelSegmentId: data.channelSegmentId,
//       channelName: data.channelName,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
//   }

//   return result;
// });
