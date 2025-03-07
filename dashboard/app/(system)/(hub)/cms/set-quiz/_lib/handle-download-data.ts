import axios from 'axios';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { handleDownload } from '../../_utils/utils';
import { QuizSetResponse } from '../_type/type';

export async function handleDownloadQuizSet(data: QuizSetResponse | undefined) {
  const zip = new JSZip();

  if (!data?.result.groupedQuizSets) {
    alert('no data');
    return;
  }

  const files: { name: string; url: string }[] = data.result.groupedQuizSets
    .filter((groupedQuizSet) => groupedQuizSet.quizSetFile != null)
    .map((groupedQuizSet) => {
      const name = groupedQuizSet.quizSetFile!.path.split('/').pop();
      return name
        ? {
            name,
            url: `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${groupedQuizSet.quizSetFile!.path}`,
          }
        : null;
    })
    .filter((file): file is { name: string; url: string } => file !== null);

  if (files.length === 0) {
    toast.info('No data to download');
    return;
  }

  // 파일들을 ZIP에 추가
  for (const file of files) {
    const response = await fetch(file.url);
    const blob = await response.blob();
    zip.file(file.name, blob);
  }

  // ZIP 파일 생성 및 다운로드
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'download.zip');
  });
}

export async function handleDownloadUploadedFile(
  campaignId: string | undefined,
  fileType: 'ACTIVITYID' | 'NON_SPLUS_DOMAINS'
) {
  if (!campaignId) {
    toast.info('No campaign id');
    return;
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cms/uploaded_file?campaignId=${campaignId}&fileType=${fileType}`
    );

    const data = response.data;
    const downloadPath = data.result.uploadedFiles[0].path;

    if (!downloadPath) {
      toast.error('No donwload path');
      return;
    }
    const QUIZSET_FILE_URL = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${downloadPath}`;
    const QUIZSET_FILE_NAME = downloadPath.split('/').pop();

    handleDownload(QUIZSET_FILE_NAME, QUIZSET_FILE_URL);
  } catch (error) {
    toast.error(`Failed to download activity ID data: ${error}`);
  }
}
