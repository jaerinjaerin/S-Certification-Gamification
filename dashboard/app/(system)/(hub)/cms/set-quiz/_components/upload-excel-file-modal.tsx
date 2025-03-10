// React & Types
import { ProcessResult } from '@/lib/quiz-excel-parser';
import { forwardRef, useState } from 'react';
import { UploadExcelFileModalProps } from '../_type/type';

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
import { FilesTableComponent, Td } from './files-table-component';

// Utils
import { cn } from '@/lib/utils';
import { isEmpty } from '../../_utils/utils';

// Hooks & State
import { useStateVariables } from '@/components/provider/state-provider';
import useQuizSetState from '../_store/quizset-state';

// API Functions
import { CircleAlert, X } from 'lucide-react';
import { CustomAlertDialog } from '../../_components/custom-alert-dialog';
import UploadResultDialog from '../../_components/upload-result-dialog';
import useFileDropZone from '../_hooks/useFileDropZone';
import { submitActivityId } from '../_lib/submit-activityId';
import { submitNonS } from '../_lib/submit-nonS';
import { submitQuizSet } from '../_lib/submit-quizset';
import { updateNoServiceChannel } from '../_lib/update-no-service-channel';

const UploadExcelFileModal = forwardRef<
  HTMLDivElement,
  UploadExcelFileModalProps
>(({ children, title, variant }, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const { campaign } = useStateVariables();
  const {
    quizSet,
    activityId,
    clearQuizSet,
    clearActivityId,
    nonS,
    clearNonS,
    ui: { alert },
    closeAlert,
  } = useQuizSetState();

  const { getRootProps, getInputProps, open, isDragActive } = useFileDropZone({
    variant,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processResult, setProcessResult] = useState<ProcessResult[]>([]);

  const uploadFiles = {
    quiz: quizSet.files,
    activityId: activityId.files,
    'non-s': nonS.files,
    hq: quizSet.files,
  };
  const uploadData = {
    quiz: quizSet.data,
    activityId: activityId.data,
    'non-s': nonS.data,
    hq: quizSet.data,
  };

  const clearUploadFile = {
    quiz: clearQuizSet,
    activityId: clearActivityId,
    'non-s': clearNonS,
    hq: clearQuizSet,
  };

  // file 객체 배열
  const getValidFiles = () => {
    const validIndices = uploadData[variant]
      .map((data, index) => (data.success ? index : -1))
      .filter((index) => index !== -1);

    return validIndices.map((index) => uploadFiles[variant][index]);
  };

  /* @return types {fileName: string, success: boolean, errors: {message: string}[]*/
  const getInvalidFiles = () => {
    const uploadDataVariant = uploadData[variant];
    const uploadFilesVariant = uploadFiles[variant];

    return uploadDataVariant
      .map((data, index) => ({
        ...data,
        fileName: uploadFilesVariant[index].name,
      }))
      .filter((data) => !data.success);
  };

  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      clearUploadFile[variant]();
    }
  };

  const submitQuiz = async () => {
    try {
      setIsLoading(true);
      const result = await submitQuizSet(
        getValidFiles(),
        campaign!.id,
        setIsDialogOpen
      );
      if (result) setProcessResult(result);
      updateNoServiceChannel(campaign!.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSumbit = {
    quiz: submitQuiz,
    activityId: async () => {
      try {
        setIsLoading(true);
        const result = await submitActivityId(
          uploadFiles.activityId,
          campaign!.id
        );
        if (result) {
          setProcessResult(result);
        }
      } finally {
        setIsLoading(false);
      }
    },
    'non-s': async () => {
      try {
        setIsLoading(true);
        const result = await submitNonS(uploadFiles['non-s'], campaign!.id);
        if (result) {
          setProcessResult(result);
        }
      } finally {
        setIsLoading(false);
      }
    },
    hq: submitQuiz,
  };

  const uploadFilesResult = [...processResult, ...getInvalidFiles()];

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
            <DialogClose className={cn(isLoading && 'pointer-events-none')}>
              <X />
            </DialogClose>
          </DialogHeader>
          {isEmpty(uploadFiles[variant]) && (
            <DropzoneView
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              open={open}
            />
          )}
          {!isEmpty(uploadFiles[variant]) && (
            <div className="flex flex-col gap-5">
              <span className="text-size-14px font-semibold">
                Total : {uploadFiles[variant].length}
              </span>
              <div className="border border-zinc-200 rounded-md max-h-[23.313rem] overflow-y-scroll">
                <FilesTableComponent>
                  {uploadFiles[variant].map((file, index) => {
                    return (
                      <tr key={index} className="border-t border-t-zinc-200">
                        <Td>{index + 1}</Td>
                        <Td>{file.name}</Td>
                        <Td>
                          {!uploadData[variant][index].success ? (
                            <div className="flex items-center gap-2.5 text-red-600 font-medium">
                              <CircleAlert className="size-4 shrink-0" />
                              <span>
                                {uploadData[variant][index].errors?.[0].message}
                              </span>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </Td>
                      </tr>
                    );
                  })}
                </FilesTableComponent>
              </div>
            </div>
          )}
          {!isEmpty(uploadFiles[variant]) && (
            <DialogFooter className="!justify-center !flex-row">
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  onClick={clearUploadFile[variant]}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className={cn('!ml-3')}
                variant="action"
                onClick={handleSumbit[variant]}
                disabled={isEmpty(getValidFiles()) || isLoading}
              >
                {isLoading ? 'Upload...' : 'Upload'}
              </Button>
            </DialogFooter>
          )}
        </CustomDialogContent>
      </Dialog>

      <UploadResultDialog
        variant={variant}
        uploadFilesResult={uploadFilesResult}
        open={!isEmpty(processResult)}
        onOpenChange={() => {
          setProcessResult([]);
          handleDialogOpen(false);
        }} // 다이얼로그가 닫힐 때 processResult를 초기화
      />

      <CustomAlertDialog
        open={alert.isOpen}
        description={alert.message}
        buttons={[
          {
            label: '확인',
            variant: 'action',
            type: 'ok',
            onClick: () => {
              closeAlert();
            },
          },
        ]}
      />
    </div>
  );
});

UploadExcelFileModal.displayName = 'UploadExcelFileModal';

export default UploadExcelFileModal;
