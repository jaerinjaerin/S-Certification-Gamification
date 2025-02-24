// UI Components
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { DropzoneView } from '../../_components/upload-files-dialog';
import { forwardRef } from 'react';

// Utils & Types
import { cn } from '@/lib/utils';
import { isEmpty } from '../../_utils/utils';

// Custom Hooks
import useFileDropZone from '../hooks/useFileDropZone';
import useQuizSetState from '../store/quizset-state';
import { ProcessResult } from '@/lib/quiz-excel-parser';
import { submitQuizSet } from '../_lib/submit-quizset';
import { submitActivityId } from '../_lib/submit-activityId';
import { ActivityIdProcessResult } from '@/lib/activityid-excel-parser';
import { UploadExcelFileModalProps } from '../_type/type';
import { submitNonS } from '../_lib/submit-nonS';

const UploadExcelFileModal = forwardRef<
  HTMLDivElement,
  UploadExcelFileModalProps
>(({ children, title, variant }, ref) => {
  const {
    quizSet,
    activityId,
    clearQuizSet,
    clearActivityId,
    nonS,
    clearNonS,
  } = useQuizSetState();

  const { getRootProps, getInputProps, open, isDragActive, fileRejections } =
    useFileDropZone({
      variant,
    });

  console.log('🥕 fileRejections', fileRejections);
  // variant에 따라 사용할 상태 결정

  const uploadFiles = {
    quiz: quizSet.files,
    activityId: activityId.files,
    'non-s': nonS.files,
  };
  const uploadData = {
    quiz: quizSet.data,
    activityId: activityId.data,
    'non-s': nonS.data,
  };

  const clearUploadFile = {
    quiz: clearQuizSet,
    activityId: clearActivityId,
    'non-s': clearNonS,
  };

  const handleSumbit = {
    quiz: () =>
      submitQuizSet(uploadData.quiz as ProcessResult[], uploadFiles.quiz),
    activityId: () => submitActivityId(uploadFiles.activityId),
    'non-s': () => submitNonS(uploadFiles['non-s']),
  };

  const getValidFiles = (
    uploadData: ProcessResult[] | ActivityIdProcessResult[]
  ) => {
    return uploadData.filter((data) => data.success);
  };

  // const getInvalidFiles = (data: ProcessResult[]) => {
  //   return data.filter((data) => !data.success);
  // };

  return (
    <div ref={ref}>
      {/* <Dialog open={isDialogOpen} onOpenChange={dialogOpenHandler}> */}
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
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
            <div>
              {uploadFiles[variant].map((file, index) => (
                <div key={index} className={cn('flex gap-5')}>
                  <span>{file.name}</span>
                  {!uploadData[variant][index].success && (
                    <span className="text-red-500">
                      {uploadData[variant][index].errors?.[0].message}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {!isEmpty(uploadFiles[variant]) && (
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" onClick={clearUploadFile[variant]}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="action"
                onClick={handleSumbit[variant]}
                disabled={isEmpty(getValidFiles(uploadData[variant]))}
              >
                Upload
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

UploadExcelFileModal.displayName = 'UploadExcelFileModal';

export default UploadExcelFileModal;
