'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '../../../lib/fetcher';
import { QuizSetResponse } from '../../_type/type';
import { useStateVariables } from '@/components/provider/state-provider';
import { LoaderWithBackground } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function QuizSetDetailClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { campaign } = useStateVariables();

  const QUIZSET_DATA_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset?campaignId=${campaign?.id}`;
  const { data, isLoading } = useSWR<QuizSetResponse>(
    QUIZSET_DATA_URL,
    fetcher
  );

  if (isLoading || !campaign) {
    return <LoaderWithBackground />;
  }

  const matchedQuizSet = data?.result.groupedQuizSets.filter(
    (quizSet) => quizSet.quizSet.id === id
  )[0];

  if (!matchedQuizSet) {
    return <div>Quiz set not found</div>;
  }

  const { quizSet, quizSetFile } = matchedQuizSet;

  return (
    <div>
      <div>
        <h3>User Information</h3>
        <div>Quiz Set File: {quizSetFile.path}</div>
        <div>
          Version:{quizSetFile.updatedAt}{' '}
          <Button>
            <Download />
          </Button>
        </div>
        <div>Domain: {quizSet.domain.name}</div>
        <div>Job Code: {quizSet.jobCodes[0].toUpperCase()}</div>
        <div>Quiz Set Language: {quizSet.language.name}</div>
      </div>
      <div>
        <h3>Imported Questions</h3>
        <div>
          {quizSet.quizStages.map((stage, index) => {
            console.log('✅TODO: stage', stage);
            return <div key={index}>1</div>;
          })}
        </div>
      </div>
    </div>
  );
}
