// React & Types
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
import InformationInputDialog from '../../_components/information-input-dialog';
import { FilesTableComponent, Td } from './files-table-component';

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

  const { getRootProps, getInputProps, open, isDragActive, fileRejections } =
    useFileDropZone({
      variant,
    });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const getValidFiles = () => {
    const validIndices = uploadData[variant]
      .map((data, index) => (data.success ? index : -1))
      .filter((index) => index !== -1);

    return validIndices.map((index) => uploadFiles[variant][index]);
  };

  const getInvalidFiles = () => {
    const validIndices = uploadData[variant]
      .map((data, index) => (!data.success ? index : -1))
      .filter((index) => index !== -1);

    return validIndices.map((index) => uploadFiles[variant][index]);
  };

  // const handleDialogOpen = () => {
  //   if (!isEmpty(getValidFiles())) {
  //     setIsDialogOpen(!isDialogOpen);
  //   }
  // };

  // const getInvalidFiles = (
  //   uploadData: ProcessResult[] | ActivityIdProcessResult[]
  // ) => {
  //   return uploadData.filter((data) => !data.success);
  // };

  const handleSumbit = {
    quiz: () => submitQuizSet(getValidFiles(), campaign!.id, setIsDialogOpen),
    activityId: () => submitActivityId(uploadFiles.activityId),
    'non-s': () => submitNonS(uploadFiles['non-s']),
  };

  return (
    <div ref={ref}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <CustomDialogContent className="gap-16">
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
                onClick={() => {
                  handleSumbit[variant]();
                  // handleDialogOpen();
                }}
                disabled={isEmpty(getValidFiles())}
              >
                Upload
              </Button>
              <InformationInputDialog
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
              />
            </DialogFooter>
          )}
        </CustomDialogContent>
      </Dialog>
    </div>
  );
});

UploadExcelFileModal.displayName = 'UploadExcelFileModal';

export default UploadExcelFileModal;
