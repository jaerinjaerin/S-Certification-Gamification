import {
  ActivityIdProcessResult,
  processActivityExcelBuffer,
} from '@/lib/activityid-excel-parser';

export async function handleActivityIdFileUpload(
  file: File
): Promise<ActivityIdProcessResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (!event.target) return reject(new Error('Failed to read file'));
      const bufferArray = event.target.result;
      if (!(bufferArray instanceof ArrayBuffer)) {
        return reject(new Error('Failed to read file as ArrayBuffer'));
      }

      const result = processActivityExcelBuffer(bufferArray);
      resolve(result);
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
