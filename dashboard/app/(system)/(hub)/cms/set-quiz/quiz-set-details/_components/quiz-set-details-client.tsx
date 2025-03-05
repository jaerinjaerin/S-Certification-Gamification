'use client';

import { LoaderWithBackground } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import { Button } from '@/components/ui/button';
import { ChevronDown, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { handleDownload } from '../../../_utils/utils';
import { fetcher } from '../../../lib/fetcher';
import { QuizSetResponse } from '../../_type/type';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Question } from '@prisma/client';

type AccessKeyType = Question & {
  characterImage: { imagePath: string; alt: string };
  backgroundImage: { imagePath: string; alt: string };
};

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

  const QUIZSET_FILE_URL = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${quizSetFile?.path}`;
  const QUIZSET_FILE_NAME = quizSetFile?.path.split('/').pop();

  const quizTableData: {
    header: string;
    accessKey: keyof AccessKeyType;
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
          <InfoComponent title="Quiz Set File" content={QUIZSET_FILE_NAME} />
          <div className="flex items-center gap-2">
            <span className="text-nowrap text-secondary">
              version : {quizSetFile?.updatedAt}
            </span>
            <Button
              onClick={() =>
                handleDownload(QUIZSET_FILE_NAME, QUIZSET_FILE_URL)
              }
              className="bg-white text-zinc-950 shadow-none size-8"
            >
              <Download />
            </Button>
          </div>
        </div>
        <InfoComponent
          className="mb-[1.188rem]"
          title="Domain"
          content={quizSet.domain.name}
        />
        <div className="flex space-x-[5.125rem]">
          <InfoComponent
            title="Job Group"
            content={quizSet.jobCodes[0].toUpperCase()}
          />
          <InfoComponent
            title="Quiz Set Language"
            content={quizSet.language?.name}
          />
        </div>
      </div>
      <div>
        <h3 className="text-size-17px font-semibold mb-[1.375rem]">
          Imported Questions
        </h3>
        <div>
          {quizSet.quizStages.map((stage, index) => {
            return (
              <Collapsible className="data-[state=open]:mb-[90px]" key={index}>
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
                                return (
                                  <TableCell
                                    key={key.accessKey}
                                    className="px-3.5"
                                  >
                                    {key.image ? (
                                      <Image
                                        src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${(question[key.accessKey] as { imagePath: string })?.imagePath}`}
                                        alt={
                                          (
                                            question[key.accessKey] as {
                                              alt: string;
                                            }
                                          )?.alt ?? ''
                                        }
                                        className="size-16 bg-zinc-200 rounded-md object-cover"
                                        width={56}
                                        height={56}
                                      />
                                    ) : (
                                      question[key.accessKey]?.toString()
                                    )}
                                  </TableCell>
                                );
                              })}
                              {/* <TableCell className="px-3.5">
                                {question.order}
                              </TableCell>
                              <TableCell className="px-3.5">
                                {question.originalIndex}
                              </TableCell>
                              <TableCell className="px-3.5">
                                {question.importance}
                              </TableCell>
                              <TableCell className="px-3.5">
                                {question.product}
                              </TableCell>
                              <TableCell className="px-3.5">
                                {question.category}
                              </TableCell>
                              <TableCell className="px-3.5">
                                {question.questionType}
                              </TableCell>
                              <TableCell className="px-3.5">
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.characterImage?.imagePath}`}
                                  alt={question.characterImage?.alt ?? ''}
                                  className="size-16 bg-zinc-200 rounded-md object-cover"
                                  width={56}
                                  height={56}
                                />
                              </TableCell>
                              <TableCell className="px-3.5">
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.backgroundImage?.imagePath}`}
                                  alt={question.backgroundImage?.alt ?? ''}
                                  className="size-16 bg-zinc-200 rounded-md object-cover"
                                  width={56}
                                  height={56}
                                />
                              </TableCell> */}
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
  content: string;
  className?: string;
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-secondary text-size-14px text-nowrap">{title}</span>
      <Input
        readOnly
        value={content}
        className="w-[20rem] h-10 !text-zinc-500 text-size-14px shadow-none"
      />
    </div>
  );
};
