export default async function QuizLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  console.log("QuizLayout", params);
  // const searchParams = useSearchParams();
  // const quizsetId = searchParams.get("quizset_id");

  // if (quizsetId === null) {
  //   window.location.href = "/error/invalid-access";
  // }

  // async function fetchData(quizSetId: string | null) {
  //   if (!quizSetId) return null;

  //   try {
  //     const response = await fetch(`/api/campaign/quiz_set/${quizSetId}`);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch data");
  //     }
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error(error);
  //     return null;
  //   }
  // }

  // const data = await fetchData(quizsetId);
  // console.log("data:", data);

  // if (!data.item || !data.item.campaign) {
  //   window.location.href = "/error/invalid-access";
  // }

  // if (data.item.campaign.startedAt < new Date()) {
  //   window.location.href = "/error/invalid-access";
  // }

  // if (data.item.campaign.endedAt > new Date()) {
  //   window.location.href = "/error/campaign-closed";
  // }

  return (
    <div>
      {/* <LocalStorageProvider> */}
      {/* <AuthProvider> */}
      {/* <QuizProvider></QuizProvider> */}
      {children}
      {/* </AuthProvider> */}
      {/* </LocalStorageProvider> */}
    </div>
  );
}
