'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { DownloadFileListPopoverButton } from '../_components/custom-popover';
import { UploadImageFileModal } from '../media-library/_components/upload-image-file-modal';
import { DataTable } from './data-table';

import { ERROR_CODES } from '@/app/constants/error-codes';
import { processExcelBuffer, ProcessResult } from '@/lib/quiz-excel-parser';
import { QuizSetWithFile } from '@/types';

export type sUser = {
  id: string;
  status: 'completed' | 'In Progress';
  subsidiary: string;
  domain: string;
  url: string;
  quizSet: string;
  activityId: string;
  uiLanguage: string;
};

export type nonSUser = {
  status: 'completed' | 'In Progress';
  subsidiary: string;
  domain: string;
  url: string;
  channelName: string;
  channelSegment: string;
  jobGroup: string;
};
const sUserColumns: ColumnDef<sUser>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'url',
    header: 'URL',
  },
  {
    accessorKey: 'quizSet',
    header: 'Quiz Set',
  },
  {
    accessorKey: 'activityId',
    header: 'Activity ID',
  },
  {
    accessorKey: 'uiLanguage',
    header: 'UI Language',
  },
];

const nonSUserColumns: ColumnDef<nonSUser>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'channelName',
    header: 'URL',
  },
  {
    accessorKey: 'channelSegment',
    header: 'Channel Segment',
  },
  {
    accessorKey: 'jobGroup',
    header: 'Job Group',
  },
];
export default function SetQuizPage() {
  const [tabState, setTabState] = useState<'s' | 'non-s'>('s');

  const [quizSetWithFiles, setQuizSetWithFiles] = useState<QuizSetWithFile[]>(
    []
  );

  useEffect(() => {
    const fetchQuizSets = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset?campaignId=c903fec8-56f8-42fe-aa06-464148d4e0a5`,
          {
            method: 'GET',
          }
        );
        if (response.ok) {
          const result = await response.json();
          setQuizSetWithFiles(result.groupedQuizSets);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchQuizSets();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="absolute top-0 right-0 ">
        <DownloadFileListPopoverButton type="template" />
      </div>
      <ExcelUploader />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span>Domain List</span>
          <Tabs
            defaultValue="s"
            className="w-[400px]"
            onValueChange={(value) => {
              setTabState(value as 's' | 'non-s');
            }}
          >
            <TabsList>
              <TabsTrigger className="min-w-[148px]" value="s">
                S+ Users
              </TabsTrigger>
              <TabsTrigger className="min-w-[148px]" value="non-s">
                Non S+ Users
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* TODO: Need Tab component  */}
        {/* TODO: Tab의 상태에 따라 버튼 변경  */}

        <div className="flex gap-3">
          <DownloadFileListPopoverButton type="data" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="action">Upload</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <UploadImageFileModal type="add">
                  <Button>Quiz Set</Button>
                </UploadImageFileModal>
              </DropdownMenuItem>
              <DropdownMenuItem>Activity ID</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* TODO 데이터 테이블 추가 */}
      {/* TODO: 상태에 따라 테이블이 변경됨 */}

      <div className="my-8">
        {tabState === 's' ? 'S+ Users' : 'Non S+ Users'}
      </div>
      {tabState === 's' && <DataTable columns={sUserColumns} data={[]} />}
      {tabState === 'non-s' && (
        <DataTable columns={nonSUserColumns} data={[]} />
      )}
      {quizSetWithFiles &&
        quizSetWithFiles.map((quizSetWithFile: QuizSetWithFile) => (
          <div
            key={quizSetWithFile.quizSet.id}
            className="border p-2 bg-gray-100 mt-2"
          >
            <h3 className="font-semibold">
              {quizSetWithFile.quizSet.domain?.subsidiary?.name},{' '}
              {quizSetWithFile.quizSet.domain?.name}, ,
              {quizSetWithFile.quizSet.domain?.code},
              {quizSetWithFile.quizSet.language?.code},{' '}
              {quizSetWithFile.quizSet.jobCodes.join(', ')}
              {quizSetWithFile.quizSetFile.path}
              {quizSetWithFile.quizSetFile ? (
                <a
                  href={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${quizSetWithFile.quizSetFile.path}`}
                  download
                >
                  <button>엑셀 다운로드</button>
                </a>
              ) : null}
            </h3>
            <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
              {quizSetWithFile.quizSet.quizStages.map((stage) => (
                <div key={stage.id}>
                  Stage {stage.name} - {stage.questions.length} questions
                  {stage.questions.map((question, index) => (
                    <div key={question.id}>
                      Q-{index + 1}: {question.text}
                      <img
                        className="w-10"
                        src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.characterImage?.imagePath}`}
                      ></img>
                      <img
                        className="w-10"
                        src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.backgroundImage?.imagePath}`}
                      ></img>
                      {question.options?.map((option) => (
                        <div key={option.id}>
                          {option.isCorrect ? '(o)' : '(x)'} {option.text}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </pre>
          </div>
        ))}
    </div>
  );
}

const ExcelUploader = () => {
  const [data, setData] = useState<ProcessResult | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0]; // 선택한 파일 가져오기
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (e: any) => {
      const bufferArray = e.target.result;
      const result: ProcessResult = processExcelBuffer(bufferArray, file.name);
      console.log(result);

      setData(result);
      setFile(file);
    };

    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };
  };

  const handleUpload = async () => {
    console.log('엑셀 파일 업로드');
    if (!data?.data || !file) {
      alert('업로드할 데이터가 없습니다.');
      return;
    }

    try {
      const { domainCode, languageCode, jobGroup, questions } = data.data;
      if (!domainCode || !languageCode || !jobGroup) {
        alert('파일명을 확인해주세요.');
        return;
      }

      if (questions.length === 0) {
        alert('질문 데이터가 없습니다.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file); // 📂 파일 추가
      formData.append(
        'jsonData',
        JSON.stringify({
          campaignId: 'c903fec8-56f8-42fe-aa06-464148d4e0a5',
          domainCode,
          languageCode,
          jobGroup,
          questions,
        })
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset`,
        {
          method: 'POST',
          // headers: {
          //   'Content-Type': 'application/json',
          // },
          body: formData,
        }
      );

      if (response.ok) {
        alert('엑셀 파일 업로드가 완료되었습니다.');
        return;
      }

      const result = await response.json();
      console.error(result);

      if (result.errorCode === ERROR_CODES.HQ_QUESTIONS_NOT_REGISTERED) {
        alert('HQ 퀴즈 질문이 등록되지 않았습니다.');
      } else if (result.errorCode === ERROR_CODES.FILE_NAME_MISMATCH) {
        alert('최신 버전의 파일을 다운받아 수정하여 업로드해주세요.');
      } else {
        // ..... result.errorCode === ERROR_CODES 참조하여 기타 오류 처리
        if (result.errorCode) {
          alert(result.errorCode);
        } else {
          alert('알 수 없는 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">엑셀 파일 업로드 & 분석</h2>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="mb-4"
      />
      <button disabled={!data} className="mt-4" onClick={() => handleUpload()}>
        엑셀 파일 업로드
      </button>
      {data && (
        <div className="border p-2 bg-gray-100 mt-2">
          <h3 className="font-semibold">📊 분석 결과 (JSON)</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
