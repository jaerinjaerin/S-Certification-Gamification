'use client';
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
import { Button } from '@/components/ui/button';
import { UploadExcelFileVariant } from '@/app/(system)/(hub)/cms/_types/type';
import {
  clearFiles,
  getValidFiles,
  processExcelFileDivided,
} from '@/app/(system)/(hub)/cms/_utils/process-excel-file';
import { uploadFileNameValidator } from '@/app/(system)/(hub)/cms/_utils/upload-file-name-validator';
import { isEmpty } from '@/app/(system)/(hub)/cms/_utils/utils';
import { useLanguageData } from '../_provider/language-data-provider';
import axios from 'axios';

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
  const { dispatch } = useLanguageData();
  const [files, setFiles] = useState<
    { file: File; json?: File; metadata: JsonObject }[]
  >([]);
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
        acceptedFiles.map(async (file) =>
          processExcelFileDivided(file, setIsConverting, variant)
        )
      );

      setFiles(processed);
    },
    noClick: true,
    noKeyboard: false,
  });

  const handleSubmit = async () => {
    // hasError가 true인 파일은 업로드하지 않음
    const validFiles = files.filter(({ metadata }) => !metadata.hasError);
    console.log('🚀 ~ handleSubmit ~ validFiles:', validFiles);
    const formData = new FormData();
    validFiles.forEach(({ file, json }) => {
      formData.append('files', file);
      if (json) {
        formData.append('jsons', json);
      }
    });
    formData.append('campaign', 'ac2fb618-384f-41aa-ab06-51546aeacd32');

    try {
      const response = await axios.post('/api/cms/language', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('🚀 File uploaded:', response.data);
    } catch (error) {
      console.error('Upload failed:', error);
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
