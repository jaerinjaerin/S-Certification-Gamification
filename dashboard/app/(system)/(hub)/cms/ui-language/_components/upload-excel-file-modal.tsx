'use client';
// React & Types
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useState,
  useReducer,
} from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  CustomDialogContent,
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { DropzoneView } from '../../_components/upload-files-dialog';

// Utils
import { cn } from '@/lib/utils';
import { isEmpty } from '../../_utils/utils';

// Hooks & State
import { useStateVariables } from '@/components/provider/state-provider';

import { CircleAlert, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import UploadResultDialog from './upload-result-dialog';
import { toast } from 'sonner';
import {
  FilesTableComponent,
  Td,
} from '../../set-quiz/_components/files-table-component';
import { mutate } from 'swr';
import { searchParamsToQuery } from '@/lib/fetch';

type UploadExcelFileModalProps = {
  children: React.ReactNode;
  title: string;
};

type ProcessResult = {
  success: boolean;
  data?: Record<string, any>;
};

interface UploadState {
  files: File[];
  data: { success: boolean; data: File }[];
  processResult: ProcessResult[];
}

type UploadAction =
  | {
      type: 'SET_FILES';
      payload: { files: File[]; data: { success: boolean; data: File }[] };
    }
  | { type: 'SET_PROCESS_RESULT'; payload: ProcessResult[] }
  | { type: 'CLEAR' };

const uploadReducer = (
  state: UploadState,
  action: UploadAction
): UploadState => {
  switch (action.type) {
    case 'SET_FILES':
      return {
        ...state,
        files: action.payload.files,
        data: action.payload.data,
      };
    case 'SET_PROCESS_RESULT':
      return {
        ...state,
        processResult: action.payload,
      };
    case 'CLEAR':
      return {
        files: [],
        data: [],
        processResult: [],
      };
    default:
      return state;
  }
};

const UploadExcelFileModal = forwardRef<
  HTMLDivElement,
  UploadExcelFileModalProps
>(({ children, title }, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const { campaign } = useStateVariables();
  const [uploadState, dispatch] = useReducer(uploadReducer, {
    files: [],
    data: [],
    processResult: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      dispatch({ type: 'CLEAR' });
    }
  };

  const getValidFiles = () => {
    const validIndices = uploadState.data
      .map((data, index) => (data.success ? index : -1))
      .filter((index) => index !== -1);

    return validIndices.map((index) => uploadState.files[index]);
  };

  const getInvalidFiles = () => {
    return uploadState.data
      .map((data, index) => ({
        ...data,
        fileName: uploadState.files[index].name,
      }))
      .filter((data) => !data.success);
  };

  const handleUiExcelFileUpload = async (
    file: File
  ): Promise<{ success: boolean; data: File }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (!event.target) return reject(new Error('Failed to read file'));
        const bufferArray = event.target.result;
        if (!(bufferArray instanceof ArrayBuffer)) {
          return reject(new Error('Failed to read file as ArrayBuffer'));
        }

        const result = {
          success: true,
          data: file,
        };

        resolve(result);
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleSubmitUiExcelFile = async (
    files: File[],
    campaignId: string,
    setIsLoading: Dispatch<SetStateAction<boolean>>
  ) => {
    try {
      setIsLoading(true);
      const uploadPromises = files.map(async (file) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('campaignId', campaignId);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cms/ui_language/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          mutate(`/api/cms/ui_language?${searchParamsToQuery({ campaignId })}`);
          return response.json();
        } catch (error) {
          console.error(`파일 "${file.name}" 업로드 중 오류 발생:`, error);
          return {
            success: false,
            fileName: file.name,
            message: '파일 업로드 중 오류가 발생했습니다.',
          };
        }
      });

      try {
        const result = await Promise.all(uploadPromises);
        dispatch({
          type: 'SET_PROCESS_RESULT',
          payload: result,
        });
      } catch (error) {
        toast.error('파일 업로드 중 오류가 발생했습니다.');
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const onDropHandler = async (acceptedFiles: File[]) => {
    const processed = await Promise.all(
      acceptedFiles.map(handleUiExcelFileUpload)
    );
    dispatch({
      type: 'SET_FILES',
      payload: { files: acceptedFiles, data: processed },
    });
  };

  const { getRootProps, getInputProps, open, isDragActive, fileRejections } =
    useDropzone({
      accept: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
        'application/vnd.ms-excel': [],
      },
      onDrop: onDropHandler,
      noClick: true,
      noKeyboard: false,
      multiple: true,
    });

  const uploadFilesResult = [
    ...uploadState.processResult,
    ...getInvalidFiles(),
  ];

  return (
    <div ref={ref}>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <CustomDialogContent
          className="gap-16"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="!flex-row !items-center justify-between">
            <DialogTitle className="text-size-17px font-semibold">
              {title}
            </DialogTitle>
            <DialogClose>
              <X />
            </DialogClose>
          </DialogHeader>
          {isEmpty(uploadState.files) && (
            <DropzoneView
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              open={open}
            />
          )}
          {!isEmpty(uploadState.files) && (
            <div className="flex flex-col gap-5">
              <span className="text-size-14px font-semibold">
                Total : {uploadState.files.length}
              </span>
              <div className="border border-zinc-200 rounded-md max-h-[23.313rem] overflow-y-scroll">
                <FilesTableComponent>
                  {uploadState.files.map((file, index) => (
                    <tr key={index} className="border-t border-t-zinc-200">
                      <Td>{index + 1}</Td>
                      <Td>{file.name}</Td>
                      <Td>
                        {!uploadState.data[index].success && (
                          <div className="flex items-center gap-2.5 text-red-600 font-medium">
                            <CircleAlert className="size-4 shrink-0" />
                            <span>{uploadState.data[index].data.name}</span>
                          </div>
                        )}
                      </Td>
                    </tr>
                  ))}
                </FilesTableComponent>
              </div>
            </div>
          )}
          {!isEmpty(uploadState.files) && (
            <DialogFooter className="!justify-center !flex-row">
              <DialogClose asChild>
                <Button variant="secondary" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className={cn('!ml-3')}
                variant="action"
                onClick={() =>
                  handleSubmitUiExcelFile(
                    uploadState.files,
                    campaign!.id,
                    setIsLoading
                  )
                }
                disabled={isEmpty(getValidFiles()) || isLoading}
              >
                Upload
              </Button>
            </DialogFooter>
          )}
        </CustomDialogContent>
      </Dialog>

      <UploadResultDialog
        uploadFilesResult={uploadFilesResult}
        open={!isEmpty(uploadState.processResult)}
        onOpenChange={() => {
          dispatch({ type: 'CLEAR' });
          handleDialogOpen(false);
        }}
      />
    </div>
  );
});

UploadExcelFileModal.displayName = 'UploadExcelFileModal';

export default UploadExcelFileModal;
