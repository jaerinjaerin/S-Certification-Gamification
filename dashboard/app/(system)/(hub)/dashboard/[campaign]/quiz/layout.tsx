import QuizQuizzesRanked from './@infoQuizzesRankedByHighestIncorrectAnswerRate/page';
import QuizIncorrectAnswerRate from './@statisticsIncorrectAnswerRateByCategory/page';
import QuizFilterForm from './@filters/page';
import { prisma } from '@/model/prisma';
import { getSearchParams } from '@/lib/params';

const QuizLayout = async ({ params }: { params: { campaign: string } }) => {
  const searchParams = getSearchParams();
  if (!searchParams.get('date.from')) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.campaign },
    });
    if (campaign) {
      searchParams.set('date.from', campaign.startedAt.toISOString());
      searchParams.set('date.to', campaign.endedAt.toISOString());
    }
  }
  searchParams.set('campaign', params.campaign);

  return (
    <div className="space-y-3">
      <QuizFilterForm />
      <QuizIncorrectAnswerRate searchParams={searchParams} />
      <QuizQuizzesRanked searchParams={searchParams} />
    </div>
  );
};

export default QuizLayout;
