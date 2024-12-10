// import { prisma } from "@/prisma-client";
// import { QuizSet } from "@prisma/client";
// import { NextRequest, NextResponse } from "next/server";

// type Props = {
//   params: {
//     domain_id: string;
//     job_id: string;
//   };
// };

// export async function GET(request: NextRequest, props: Props) {
//   try {
//     const quizSets = await prisma.quizSet.findMany({
//       where: {
//         domainId: props.params.domain_id,
//         jobIds: {
//           has: props.params.job_id,
//         }
//       },
//     });

//     if (!quizSets.length) {
//       return NextResponse.json(
//         {
//           status: 404,
//           message: "Not found",
//           error: {
//             code: "NOT_FOUND",
//             details: "No quiz sets found for the specified domain",
//           },
//         },
//         { status: 404 }
//       );
//     }

//     const languageIds = quizSets.map(
//       (cdqs: QuizSet) => cdqs.languageId
//     );
//     const languages = await prisma.language.findMany({
//       where: {
//         id: {
//           in: languageIds,
//         },
//       },
//     });

//     return NextResponse.json({ items: languages }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching activity data:", error);

//     const errorMessage =
//       error instanceof Error ? error.message : "An unknown error occurred";

//     return NextResponse.json(
//       {
//         status: 500,
//         message: "Internal server error",
//         error: {
//           code: "INTERNAL_SERVER_ERROR",
//           details: errorMessage,
//         },
//       },
//       { status: 500 }
//     );
//   }
// }
