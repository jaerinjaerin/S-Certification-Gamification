// React & Types
import { forwardRef, useState } from 'react';
import { UploadExcelFileModalProps } from '../_type/type';
import { ProcessResult } from '@/lib/quiz-excel-parser';

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
// import InformationInputDialog from '../../_components/information-input-dialog';

// Utils
import { cn } from '@/lib/utils';
import { isEmpty } from '../../_utils/utils';

// Hooks & State

import useQuizSetState from '../_store/quizset-state';
import { useStateVariables } from '@/components/provider/state-provider';

// API Functions
import { submitQuizSet } from '../_lib/submit-quizset';
import { submitActivityId } from '../_lib/submit-activityId';
// import { submitNonS } from '../_lib/submit-nonS';
import useFileDropZone from '../_hooks/useFileDropZone';
import { CustomAlertDialog } from '../../_components/custom-alert-dialog';

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
    ui: { alert },
    closeAlert,
  } = useQuizSetState();

  const { getRootProps, getInputProps, open, isDragActive } = useFileDropZone({
    variant,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<ProcessResult[]>([]);

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

  // file 객체 배열
  const getValidFiles = () => {
    const validIndices = uploadData[variant]
      .map((data, index) => (data.success ? index : -1))
      .filter((index) => index !== -1);

    return validIndices.map((index) => uploadFiles[variant][index]);
  };

  // @types {fileName: string, success: boolean, errors: {message: string}[]
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

  const handleSumbit = {
    quiz: async () => {
      const result = await submitQuizSet(
        getValidFiles(),
        campaign!.id,
        setIsDialogOpen
      );
      if (result) {
        setUploadResult(result);
      }
    },
    activityId: async () => {
      const result = await submitActivityId(
        uploadFiles.activityId,
        campaign!.id
      );
      if (result) {
        setUploadResult(result);
      }
    },
    'non-s': () => console.log('🥕 non-s'),
  };

  // TODO: 테이블 결과창 다시 수정
  const test = [...uploadResult, ...getInvalidFiles()];
  console.log('🥕 test', test);
  console.log(
    '🥕 activityFiles',
    uploadFiles.activityId,
    'activityData',
    uploadData.activityId
  );

  return (
    <div ref={ref}>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <CustomDialogContent
          className="gap-16"
          onCloseAutoFocus={() => handleDialogOpen(false)}
        >
          <DialogHeader>
            <DialogTitle className="text-size-17px font-semibold">
              {title}
            </DialogTitle>
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
                  {uploadFiles[variant].map((file, index) => (
                    <tr key={index} className="border-t border-t-zinc-200">
                      <Td>{index + 1}</Td>
                      <Td>{file.name}</Td>
                      <Td>
                        {!uploadData[variant][index].success && (
                          <span className="text-red-500">
                            {uploadData[variant][index].errors?.[0].message}
                          </span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </FilesTableComponent>
              </div>
            </div>
          )}
          {!isEmpty(uploadFiles[variant]) && (
            <DialogFooter className="!justify-center !flex-row">
              <DialogClose asChild>
                <Button variant="secondary" onClick={clearUploadFile[variant]}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className={cn('!ml-3')}
                variant="action"
                // onClick={handleSumbit[variant]}
                onClick={handleSumbit[variant]}
                disabled={isEmpty(getValidFiles())}
              >
                Upload
              </Button>
              {/* <InformationInputDialog
                state={getValidFiles().length > 0 ? 'success' : 'error'}
                type="multi"
                tableContent={
                  <FilesTableComponent>
                    {uploadFiles[variant]
                      .reduce<{ file: File; index: number }[]>(
                        (acc, file, index) => {
                          if (!uploadData[variant][index].success) {
                            acc.push({ file, index });
                          }
                          return acc;
                        },
                        []
                      )
                      .map(({ file, index }) => {
                        return (
                          <tr
                            key={index}
                            className="border-t border-t-zinc-200"
                          >
                            <Td>{index + 1}</Td>
                            <Td>{file.name}</Td>
                            <Td>
                              <span className="text-red-500">
                                {uploadData[variant][index]?.errors &&
                                  uploadData[variant][index]?.errors[0]
                                    ?.message}
                              </span>
                            </Td>
                          </tr>
                        );
                      })}
                  </FilesTableComponent>
                }
                uploadData={[
                  {
                    totalLength: uploadFiles[variant].length,
                    invalidLength: getInvalidFiles().length,
                  },
                ]}
              /> */}
            </DialogFooter>
          )}
        </CustomDialogContent>
      </Dialog>
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
