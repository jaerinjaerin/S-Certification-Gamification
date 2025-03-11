/* eslint-disable @next/next/no-img-element */
'use client';

import { LoaderWithBackground } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
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
import { Image, QuestionType } from '@prisma/client';
import { ChevronDown, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
// import { handleDownload } from '../../../_utils/utils';
import { fetcher } from '../../../lib/fetcher';
import { QuizSetDetailsResponse } from '../../_type/type';
// import dayjs from 'dayjs';

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
  const { data, isLoading } = useSWR<QuizSetDetailsResponse>(
    QUIZSET_DATA_URL,
    fetcher
  );

  if (isLoading || !campaign) {
    return <LoaderWithBackground />;
  }

  const quizSet = data?.result.quizSet;

  // TODO: 파일 다운로드 기능 추가
  // const QUIZSET_FILE_URL = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${quizSetFile?.path}`;
  // const QUIZSET_FILE_NAME = quizSetFile?.path.split('/').pop();

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
        <h3 className="text-size-17px font-semibold mb-[1.375rem]">
          User Information
        </h3>
        <div className="flex items-center gap-3 mb-[1.688rem]">
          {/* <InfoComponent title="Quiz Set File" content={QUIZSET_FILE_NAME} /> */}
          <div className="flex items-center gap-2">
            <span className="text-nowrap text-secondary">
              {/* data : {quizSetFile?.updatedAt} */}
              {/* date : {dayjs(quizSetFile?.updatedAt).format('YY.MM.DD HH:mm:ss')} */}
            </span>
            <Button
              onClick={() =>
                // handleDownload(QUIZSET_FILE_NAME, QUIZSET_FILE_URL)
                console.log('파일 다운로드 필요')
              }
              className="bg-white text-zinc-950 shadow-none size-8"
            >
              <Download />
            </Button>
          </div>
        </div>
        {/* <InfoComponent
          className="mb-[1.188rem]"
          title="Domain"
          content={domain.name}
        /> */}
        <div className="flex space-x-[5.125rem]">
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
          Imported Questions
        </h3>
        <div>
          {quizSet?.quizStages.map((stage: QuizStageEx, index: number) => {
            return (
              <Collapsible
                defaultOpen={index === 0}
                className="data-[state=open]:mb-[90px]"
                key={index}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex gap-4 items-center mb-8 group">
                    <p className="font-bold">Stage {stage.order}</p>
                    <Button className="w-[17px] h-[17px] bg-zinc-50 shadow-none rounded-none text-zinc-950 p-0 hover:bg-zinc-200">
                      <ChevronDown className="!w-2 h-auto group-data-[state=open]:rotate-180" />
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-4 ">
                  {stage.questions.map((question) => {
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
                                console.log(question[key.accessKey]);
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
                            <ul>
                              {question.options.map((option) => {
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
            );
          })}
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
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-secondary text-size-14px text-nowrap">{title}</span>
      <div className="w-[20rem] h-10 flex items-center border rounded-md border-zinc-200 p-3 !text-zinc-500 text-size-14px shadow-none">
        {content}
      </div>
    </div>
  );
};
