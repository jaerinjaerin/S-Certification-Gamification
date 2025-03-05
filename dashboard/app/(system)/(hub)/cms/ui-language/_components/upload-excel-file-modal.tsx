/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { FileRejection, useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { DialogTitle } from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { uploadFileNameValidator } from '@/app/(system)/(hub)/cms/_utils/upload-file-name-validator';
import { isEmpty } from '@/app/(system)/(hub)/cms/_utils/utils';
import { useLanguageData } from '../_provider/language-data-provider';
import axios from 'axios';
import { LoaderWithBackground } from '@/components/loader';
import { processAndExportExcelAndJson } from '../_lib/file-converter';
import { useStateVariables } from '@/components/provider/state-provider';

type UploadExcelFileModalProps = {
  children: React.ReactNode;
  title: string;
};

export default function UploadExcelFileModal({
  children,
  title,
}: UploadExcelFileModalProps) {
  const { campaign } = useStateVariables();
  const { state, dispatch } = useLanguageData();
  const [files, setFiles] = useState<LanguageConvertedProps[]>([]);
  const [processResult, setProcessResult] = useState<LanguageConvertedProps[]>(
    []
  );

  const [isConverting, setIsConverting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/vnd.ms-excel': [],
    },
    onDrop: async (acceptedFiles) => {
      const fileNameValidationResults = acceptedFiles.map((file) =>
        uploadFileNameValidator(file, 'ui')
      );
      const validFiles = fileNameValidationResults.filter(
        ({ metadata }) => !metadata.hasError
      );
      const invalidFiles = fileNameValidationResults.filter(
        ({ metadata }) => metadata.hasError
      );

      const processed = await Promise.all(
        validFiles.map(async (file) =>
          processAndExportExcelAndJson(file!.file, setIsConverting)
        )
      );
      setFiles([...processed, ...invalidFiles]);
    },
    noClick: true,
    noKeyboard: false,
  });

  const updateData = (updatedItems: LanguageProps[]) => {
    const data = state.languages || [];

    // 특정 `id`를 가진 항목만 업데이트하고 나머지는 그대로 유지
    const updatedData = data.map((item) => {
      const updatedItem = updatedItems.find(
        (updateItem) => updateItem.id === item.id
      );
      return updatedItem ? { ...item, ...updatedItem } : item;
    });

    dispatch({ type: 'SET_LANGUAGE_LIST', payload: updatedData });
  };

  const dataFilterNoHasError = (files: LanguageConvertedProps[]) => {
    return files.filter(({ metadata }) => !metadata.hasError);
  };

  const handleSubmit = async () => {
    // hasError가 true인 파일은 업로드하지 않음

    const validFiles = dataFilterNoHasError(files);
    const formData = new FormData();
    validFiles.forEach(({ file, json }) => {
      formData.append('files', file);
      if (json) formData.append('jsons', json);
    });
    formData.append('campaign', JSON.stringify(campaign));

    try {
      setLoading(true);

      const response = await axios.post('/api/cms/language', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('🚀 File uploaded:', response.data);
      updateData(response.data.result);
      setProcessResult(response.data.result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      dialogOpenHandler(false);
      setLoading(false);
      handleClear();
    }
  };

  const dialogOpenHandler = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      handleClear();
    }
  };

  const handleClear = () => {
    setFiles([]);
  };

  //TODO:fileRejections에 요소가 있는 경우, AlertDialog 띄우고, dropzone 요소 닫기
  console.log('🥕 files', files);
  return (
    <>
      {loading && <LoaderWithBackground />}
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
                files.map(({ file, metadata }, index) => (
                  <div key={index} className={cn('flex gap-5')}>
                    <span>{file.name}</span>
                    {metadata.hasError && (
                      <span className="text-red-500">
                        {metadata.errorMessage}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}
          {!isEmpty(files) && (
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" onClick={handleClear}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="action"
                onClick={handleSubmit}
                disabled={isConverting || isEmpty(dataFilterNoHasError(files))}
              >
                Upload
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
