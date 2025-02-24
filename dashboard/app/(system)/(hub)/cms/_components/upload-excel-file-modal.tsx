import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropzoneView } from './upload-files-dialog';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { DialogTitle } from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import {
  processExcelFile,
  getValidFiles,
  clearFiles,
} from '../_utils/process-excel-file';
import { isEmpty } from '../_utils/utils';
import { FileWithExtraInfo, UploadExcelFileVariant } from '../_types/type';
import { Button } from '@/components/ui/button';
import { uploadFileNameValidator } from '../_utils/upload-file-name-validator';

type UploadExcelFileModalProps = {
  children: React.ReactNode;
  title: string;
  variant: UploadExcelFileVariant;
};

export default function UploadExcelFileModal({
  children,
  title,
  variant,
}: UploadExcelFileModalProps) {
  const [files, setFiles] = useState<FileWithExtraInfo[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/vnd.ms-excel': [],
    },
    validator: (file) => uploadFileNameValidator(file, variant),
    onDrop: async (acceptedFiles) => {
      const processed = await Promise.all(
        acceptedFiles.map((file) =>
          processExcelFile(file, setIsConverting, variant)
        )
      );
      setFiles(processed);
    },
    noClick: true,
    noKeyboard: false,
  });

  const handleSubmit = async () => {
    // hasError가 true인 파일은 업로드하지 않음
    const validFiles = files.filter((file) => !file.hasError);
    const formData = new FormData();
    validFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/cms/target', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const result = await response.json();
      console.log('업로드 성공', result);
    } catch (error) {
      console.error('업로드 실패', error);
    }
  };

  const dialogOpenHandler = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      clearFiles(setFiles);
    }
  };

  console.log(
    '🥕 acceptedFiles',
    acceptedFiles,
    'acceptedFiles',
    fileRejections
  );
  //TODO:fileRejections에 요소가 있는 경우, AlertDialog 띄우고, dropzone 요소 닫기

  return (
    <Dialog open={isDialogOpen} onOpenChange={dialogOpenHandler}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {isEmpty(files) && (
          <DropzoneView
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            open={open}
          />
        )}
        {!isEmpty(files) && (
          <div>
            {isConverting && <div>Converting...</div>}
            {!isConverting &&
              files.map((file, index) => (
                <div key={index} className={cn('flex gap-5')}>
                  <span>{file.name}</span>
                  {file.hasError && (
                    <span className="text-red-500">{file.errorMessage}</span>
                  )}
                </div>
              ))}
          </div>
        )}
        {!isEmpty(files) && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" onClick={() => clearFiles(setFiles)}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="action"
              onClick={handleSubmit}
              disabled={isConverting || isEmpty(getValidFiles(files))}
            >
              Upload
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
