import { processExcelBuffer, ProcessResult } from '@/lib/quiz-excel-parser';

export async function handleQuizSetFileUpload(
  file: File
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    console.log('🥑🥑🥑🥑🥑🥑🥑🥑🥑🥑🥑🥑🥑 ');
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (!event.target) return reject(new Error('Failed to read file'));
      const bufferArray = event.target.result;
      if (!(bufferArray instanceof ArrayBuffer)) {
        return reject(new Error('Failed to read file as ArrayBuffer'));
      }

      const result = processExcelBuffer(bufferArray, file.name);
      resolve(result);
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
