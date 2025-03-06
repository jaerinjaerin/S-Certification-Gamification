'use client';
import { isEmpty } from '@/app/(system)/(hub)/cms/_utils/utils';
import { LoaderWithBackground } from '@/components/loader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { DialogTitle } from '@radix-ui/react-dialog';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { processAndExportExcelAndJsonObject } from '../_lib/file-converter';
import { useStateVariables } from '@/components/provider/state-provider';
import { CircleAlert } from 'lucide-react';
import { useTargetData } from '../_provider/target-data-provider';
import { DropzoneView } from './upload-files-dialog';
import { CustomAlertDialog } from '../../_components/custom-alert-dialog';
import { uploadFileNameValidator } from '../_lib/upload-file-name-validator';

type UploadExcelFileModalProps = {
  children: React.ReactNode;
  title: string;
};

const ERROR_MESSAGES = {
  'file-invalid-type': 'The uploaded file does not match the required format.',
  'file-too-large': 'File is too large.',
  'too-many-files': 'Only one file can be uploaded.',
  'invalid-file-name': 'Invalid target file name.',
  default: 'Invalid file format',
} as const;

export default function UploadExcelFileModal({
  children,
  title,
}: UploadExcelFileModalProps) {
  const { campaign } = useStateVariables();
  const { state, dispatch } = useTargetData();
  const [files, setFiles] = useState<TargetConvertedProps[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 에러 처리 로직 개선
  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const errorMessages = fileRejections.map(
      (file) =>
        ERROR_MESSAGES[file.errors[0].code as keyof typeof ERROR_MESSAGES] ||
        ERROR_MESSAGES.default
    );
    setErrors([...new Set(errorMessages)]);
  }, []);

  const { getRootProps, getInputProps, open, isDragActive, fileRejections } =
    useDropzone({
      accept: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
        'application/vnd.ms-excel': [],
      },
      onDrop: async (acceptedFiles) => {
        const processed = await Promise.all(
          acceptedFiles.map(async (file) =>
            processAndExportExcelAndJsonObject(file, setIsConverting)
          )
        );

        setFiles(processed);
      },
      validator: (file) => {
        if (!file.name) return null;
        const checkFileValidation = uploadFileNameValidator(file);

        if (checkFileValidation.metadata?.hasError) {
          return (
            checkFileValidation.errors?.map((error) => ({
              code: error.code,
              message: error.message,
            })) ?? null
          );
        }
        return null;
      },
      multiple: false,
      noClick: true,
      noKeyboard: false,
      onDropRejected,
    });

  // 데이터 업데이트 로직 개선
  const updateData = useCallback(
    (updatedItems: TargetProps[]) => {
      dispatch({
        type: 'SET_TARGET_LIST',
        payload: Array.from(
          new Map(
            [...(state.targets || []), ...updatedItems].map((item) => [
              item.domainId,
              item,
            ])
          ).values()
        ),
      });
    },
    [dispatch, state.targets]
  );

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

  useEffect(() => {
    if (fileRejections.length > 0) {
      setIsOpen(true);
    }
  }, [fileRejections]);

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
              {isConverting && <LoaderWithBackground />}
              {!isConverting &&
                files.map(({ file, metadata }, index) => (
                  <div key={index} className={cn('flex gap-5')}>
                    <span>{file.name}</span>
                    {metadata.hasError && (
                      <div className="flex items-center gap-2.5 text-red-600 font-medium">
                        <CircleAlert className="size-4" />
                        <span> {metadata.errorMessage}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
          {!isEmpty(files) && (
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  onClick={handleClear}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="action"
                onClick={handleSubmit}
                disabled={
                  isConverting ||
                  isEmpty(dataFilterNoHasError(files)) ||
                  loading
                }
              >
                Upload
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <CustomAlertDialog
        open={isOpen}
        className="max-w-[20rem]"
        description={errors[0]}
        buttons={[
          {
            label: 'OK',
            type: 'ok',
            variant: 'secondary',
            onClick: () => setIsOpen(false),
          },
        ]}
      />
    </>
  );
}
