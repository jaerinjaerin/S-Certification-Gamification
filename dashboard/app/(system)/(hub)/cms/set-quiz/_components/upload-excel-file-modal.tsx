// React & Types
import { forwardRef, useState } from 'react';
import { UploadExcelFileModalProps } from '../_type/type';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import useFileDropZone from '../hooks/useFileDropZone';
import useQuizSetState from '../store/quizset-state';
import { useStateVariables } from '@/components/provider/state-provider';

// API Functions
import { submitQuizSet } from '../_lib/submit-quizset';
import { submitActivityId } from '../_lib/submit-activityId';
import { submitNonS } from '../_lib/submit-nonS';

const UploadExcelFileModal = forwardRef<
  HTMLDivElement,
  UploadExcelFileModalProps
>(({ children, title, variant }, ref) => {
  const { campaign } = useStateVariables();

  const {
    quizSet,
    activityId,
    clearQuizSet,
    clearActivityId,
    nonS,
    clearNonS,
  } = useQuizSetState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { getRootProps, getInputProps, open, isDragActive } = useFileDropZone({
    variant,
  });

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

  const getValidFiles = () => {
    const validIndices = uploadData[variant]
      .map((data, index) => (data.success ? index : -1))
      .filter((index) => index !== -1);

    return validIndices.map((index) => uploadFiles[variant][index]);
  };

  const handleSumbit = {
    quiz: () => submitQuizSet(getValidFiles(), campaign!.id, setIsDialogOpen),
    activityId: () => submitActivityId(uploadFiles.activityId),
    'non-s': () => submitNonS(uploadFiles['non-s']),
  };

  return (
    <div ref={ref}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                disabled={isEmpty(getValidFiles())}
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
