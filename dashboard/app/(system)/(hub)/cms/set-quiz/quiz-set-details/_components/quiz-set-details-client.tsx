/* eslint-disable @next/next/no-img-element */
'use client';
import { LoadingFullScreen } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { QuizStageEx } from '@/types/apiTypes';
import { Image, QuestionOption, QuestionType } from '@prisma/client';
import { ChevronDown, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { handleDownload } from '../../../_utils/utils';
import { fetcher } from '../../../lib/fetcher';
import { QuizSetDetailsResponse } from '../../_type/type';
import { format } from 'date-fns';

type accessKeyType = {
  order: string;
  originalIndex: number;
  importance?: string;
  product?: string;
  category?: string;
  questionType: QuestionType;
  characterImage?: Image;
  backgroundImage?: Image;
};

export default function QuizSetDetailsClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { campaign } = useStateVariables();
  const router = useRouter();
  const QUIZSET_DATA_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset/${id}`;

  const { data, isLoading, error } = useSWR<QuizSetDetailsResponse>(
    QUIZSET_DATA_URL,
    fetcher
  );

  const quizSet = data?.result.quizSet;
  const quizSetFile = data?.result.quizSetFile;

  const disabledData: any[] = [];

  quizSet?.quizStages.map((stage) => {
    stage.questions.filter((question) => {
      if (!question.enabled) {
        disabledData.push(question);
      }
    });
  });

  if (isLoading || !campaign) {
    return <LoadingFullScreen />;
  }

  // TODO: 파일 다운로드 기능 추가
  const QUIZSET_FILE_URL = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${quizSetFile?.path}`;
  const QUIZSET_FILE_NAME = quizSetFile?.path.split('/').pop();
  const domain = QUIZSET_FILE_NAME?.split('.')[0];

  const quizTableData: {
    header: string;
    accessKey: keyof accessKeyType;
    image: boolean;
  }[] = [
    { header: 'Order', accessKey: 'order', image: false },
    { header: 'HQ', accessKey: 'originalIndex', image: false },
    { header: 'Imp.', accessKey: 'importance', image: false },
    { header: 'Product', accessKey: 'product', image: false },
    { header: 'Category', accessKey: 'category', image: false },
    { header: 'Question Type', accessKey: 'questionType', image: false },
    { header: 'Character Image', accessKey: 'characterImage', image: true },
    { header: 'Background Image', accessKey: 'backgroundImage', image: true },
  ];

  return (
    <div className="space-y-[5.875rem]">
      <div>
        <div
          className={'flex items-center justify-between gap-4 mb-[1.375rem]'}
        >
          <h3 className="text-size-17px font-semibold ">Information</h3>
          <div className="flex right items-center gap-2">
            <span className="text-nowrap text-secondary">
              Updated By : {quizSet?.updatedBy}
            </span>
            <span>/</span>
            <span className="text-nowrap text-secondary">
              At :{' '}
              {format(
                quizSet?.updatedAt ?? quizSet?.createdAt ?? new Date(),
                'yyyy.MM.dd HH:mm:ss'
              )}
            </span>
            <Button
              onClick={() =>
                handleDownload(QUIZSET_FILE_NAME, QUIZSET_FILE_URL)
              }
              className="bg-white text-zinc-950 shadow-none size-8 hover:bg-stone-200"
              variant={'default'}
            >
              <Download />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <InfoComponent title="Quiz Set File" content={QUIZSET_FILE_NAME} />
          <InfoComponent title="Domain" content={domain} />
          <InfoComponent
            title="Job Group"
            content={quizSet?.jobCodes[0].toUpperCase()}
          />
          <InfoComponent
            title="Quiz Set Language"
            content={quizSet?.language?.name}
          />
        </div>
      </div>

      <div>
        <h3 className="text-size-17px font-semibold mb-[1.375rem]">
          Questions
        </h3>
        <div>
          {quizSet?.quizStages.map((stage: QuizStageEx, index: number) => {
            const enabledData: any[] = [];

            stage.questions.filter((question) => {
              if (question.enabled) {
                enabledData.push(question);
              }
            });

            return (
              <Collapsible
                defaultOpen={index === 0}
                className="data-[state=open]:mb-[90px]"
                key={index}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex gap-4 items-center mb-8 group">
                    <p className="font-bold">
                      Stage {stage.order} ({enabledData.length})
                    </p>
                    <Button className="w-[17px] h-[17px] bg-zinc-50 shadow-none rounded-none text-zinc-950 p-0 hover:bg-zinc-200">
                      <ChevronDown className="!w-2 h-auto group-data-[state=open]:rotate-180" />
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-4 ">
                  {enabledData.map((question) => {
                    return (
                      <div
                        key={question.id}
                        className="p-6 border border-zinc-200 rounded-lg space-y-[3.313rem]"
                      >
                        <Table className="bg-zinc-50 rounded-md py-3">
                          <TableHeader>
                            <TableRow className="border-none">
                              {quizTableData.map((header) => {
                                return (
                                  <TableHead
                                    key={header.header}
                                    className="px-3.5"
                                  >
                                    {header.header}
                                  </TableHead>
                                );
                              })}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              {quizTableData.map((key) => {
                                return (
                                  <TableCell
                                    key={key.accessKey}
                                    className="px-3.5"
                                  >
                                    {(key.image &&
                                      key.accessKey === 'backgroundImage') ||
                                    key.accessKey === 'characterImage' ? (
                                      <img
                                        src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question[key.accessKey]?.imagePath}`}
                                        alt={question[key.accessKey]?.alt ?? ''}
                                        className="size-16 bg-zinc-200 rounded-md object-cover"
                                      />
                                    ) : question[key.accessKey] ? (
                                      question[key.accessKey]?.toString()
                                    ) : (
                                      '-'
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-3">
                            <p className="font-bold">Question</p>
                            <p>{question.text}</p>
                          </div>
                          <div className="space-y-3">
                            <p className="font-bold">Answer</p>
                            <ul className="space-y-3">
                              {question.options.map(
                                (option: QuestionOption) => {
                                  return (
                                    <li
                                      className={cn(
                                        'block border border-zinc-200 rounded-xl py-3 px-4',
                                        option.isCorrect && 'text-blue-600'
                                      )}
                                      key={option.id}
                                    >
                                      {option.text}
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          <Collapsible className="data-[state=open]:mb-[90px]">
            <CollapsibleTrigger asChild>
              <div className="flex gap-4 items-center mb-8 group">
                <p className="font-bold">Disabled ({disabledData.length})</p>
                <Button className="w-[17px] h-[17px] bg-zinc-50 shadow-none rounded-none text-zinc-950 p-0 hover:bg-zinc-200">
                  <ChevronDown className="!w-2 h-auto group-data-[state=open]:rotate-180" />
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-4 ">
              {disabledData.map((question) => {
                return (
                  <div
                    key={question.id}
                    className="p-6 border border-zinc-200 rounded-lg space-y-[3.313rem]"
                  >
                    <Table className="bg-zinc-50 rounded-md py-3">
                      <TableHeader>
                        <TableRow className="border-none">
                          {quizTableData.map((header) => {
                            return (
                              <TableHead key={header.header} className="px-3.5">
                                {header.header}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          {quizTableData.map((key) => {
                            return (
                              <TableCell key={key.accessKey} className="px-3.5">
                                {(key.image &&
                                  key.accessKey === 'backgroundImage') ||
                                key.accessKey === 'characterImage' ? (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question[key.accessKey]?.imagePath}`}
                                    alt={question[key.accessKey]?.alt ?? ''}
                                    className="size-16 bg-zinc-200 rounded-md object-cover"
                                  />
                                ) : question[key.accessKey] ? (
                                  question[key.accessKey]?.toString()
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <p className="font-bold">Question</p>
                        <p>{question.text}</p>
                      </div>
                      <div className="space-y-3">
                        <p className="font-bold">Answer</p>
                        <ul>
                          {question.options.map((option: QuestionOption) => {
                            return (
                              <li
                                className={cn(
                                  'block',
                                  option.isCorrect && 'text-blue-600'
                                )}
                                key={option.id}
                              >
                                {option.text}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div className="w-full flex justify-center mt-[1.188rem]">
          <Button onClick={() => router.back()} variant={'secondary'}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

const InfoComponent = ({
  title,
  content,
  className,
}: {
  title: string;
  content: string | undefined;
  className?: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-secondary text-size-14px text-nowrap text-stone-500 w-32">
        {title}
      </span>
      <div
        className={cn(
          'w-[20rem] h-10 flex items-center p-3 !text-zinc-500 text-size-14px shadow-none font-bold',
          className
        )}
      >
        {content}
      </div>
    </div>
  );
};
