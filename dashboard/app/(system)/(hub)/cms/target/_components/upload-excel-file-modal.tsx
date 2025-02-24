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
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { DialogTitle } from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadExcelFileVariant } from '@/app/(system)/(hub)/cms/_types/type';
import { uploadFileNameValidator } from '@/app/(system)/(hub)/cms/_utils/upload-file-name-validator';
import { isEmpty } from '@/app/(system)/(hub)/cms/_utils/utils';
import { useTargetData } from '../_provider/target-data-provider';
import axios from 'axios';
import { LoaderWithBackground } from '@/components/loader';
import { processAndExportExcelAndJsonObject } from '../_lib/file-converter';
import { useStateVariables } from '@/components/provider/state-provider';

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
  const { campaign } = useStateVariables();
  const { state, dispatch } = useTargetData();
  const [files, setFiles] = useState<TargetConvertedProps[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
          processAndExportExcelAndJsonObject(file, setIsConverting)
        )
      );

      setFiles(processed);
    },
    multiple: false,
    noClick: true,
    noKeyboard: false,
  });

  const updateData = (updatedItems: TargetProps[]) => {
    const data = state.targets || [];

    // 특정 `id`를 가진 항목만 업데이트하고 나머지는 그대로 유지
    const updatedData = data.map((item) => {
      const updatedItem = updatedItems.find(
        (updateItem) => updateItem.id === item.id
      );
      return updatedItem ? { ...item, ...updatedItem } : item;
    });

    dispatch({ type: 'SET_TARGET_LIST', payload: updatedData });
  };

  const dataFilterNoHasError = (files: TargetConvertedProps[]) => {
    return files.filter(({ metadata }) => !metadata.hasError);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return console.warn('No file selected for upload');

    const { file, json, metadata } = files[0];
    if (metadata.hasError) {
      return console.warn('File has error');
    }

    if (!json) {
      return console.warn('Json is empty');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('json', JSON.stringify(json));
    formData.append('campaign', JSON.stringify(campaign));

    try {
      setLoading(true);

      const response = await axios.post('/api/cms/target', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // console.log('🚀 File uploaded:', response.data);
      updateData(response.data.result);
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
