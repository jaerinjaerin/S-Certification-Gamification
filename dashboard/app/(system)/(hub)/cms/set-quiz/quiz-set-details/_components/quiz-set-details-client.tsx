'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '../../../lib/fetcher';
import { QuizSetResponse } from '../../_type/type';
import { useStateVariables } from '@/components/provider/state-provider';
import { LoaderWithBackground } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { handleDownload } from '../../../_utils/utils';

export default function QuizSetDetailsClient() {
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

  const QUIZSET_FILE_URL = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${quizSetFile.path}`;
  const QUIZSET_FILE_NAME = quizSetFile.path.split('/').pop();

  return (
    <div>
      <div>
        <h3>User Information</h3>
        <div>Quiz Set File: {QUIZSET_FILE_NAME}</div>
        <div>
          Version:{quizSetFile.updatedAt}{' '}
          <Button
            onClick={() => handleDownload(QUIZSET_FILE_NAME, QUIZSET_FILE_URL)}
          >
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
            return (
              <div key={index}>
                <span className="font-extrabold text-2xl">
                  Stage :{stage.order}
                </span>
                <div>
                  {stage.questions.map((question) => {
                    return (
                      <div key={question.id}>
                        <div>Order:{question.order}</div>
                        <div>HQ: {question.originalIndex}</div>
                        <div>Imp.: {question.importance}</div>
                        <div>Product: {question.product}</div>
                        <div>Category: {question.category}</div>
                        <div>Question Type: {question.questionType}</div>
                        <div>
                          Character Image:
                          <img
                            src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.characterImage?.imagePath}`}
                            alt={question.characterImage?.alt ?? ''}
                            className="size-16 bg-zinc-200 rounded-md"
                          />
                        </div>
                        <div>
                          Background Image:
                          <img
                            src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.backgroundImage?.imagePath}`}
                            alt={question.backgroundImage?.alt ?? ''}
                            className="size-16 bg-zinc-200 rounded-md"
                          />
                        </div>
                        <div>Question:{question.text}</div>
                        <div>
                          Answer
                          <div>
                            {question.options.map((option) => {
                              return (
                                <span
                                  className={cn(
                                    'block',
                                    option.isCorrect && 'bg-red-400'
                                  )}
                                  key={option.id}
                                >
                                  {option.text}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <Separator />
                      </div>
                    );
                  })}
                </div>
                <Separator />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
