import { useDropzone } from 'react-dropzone';
import useQuizSetState from '../_store/quizset-state';
import { handleQuizSetFileUpload } from '../_lib/handle-quizset-file-upload';
import { handleActivityIdFileUpload } from '../_lib/handle-activityId-file-upload';
import { UploadExcelFileVariant } from '../_type/type';
import { handleNonSFileUpload } from '../_lib/handle-nonS-file-upload';

type VariantHandlers<T> = {
  handleUpload: (file: File) => Promise<T> | T;
  setData: (data: { data: T[]; files: File[] }) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const varinatHandlers: Record<UploadExcelFileVariant, VariantHandlers<any>> = {
  quiz: {
    handleUpload: handleQuizSetFileUpload,
    setData: useQuizSetState.getState().setQuizSet,
  },
  activityId: {
    handleUpload: handleActivityIdFileUpload,
    setData: useQuizSetState.getState().setActivityId,
  },
  'non-s': {
    handleUpload: handleNonSFileUpload,
    setData: useQuizSetState.getState().setNonS,
  },
};
export default function useFileDropZone({
  variant,
}: {
  variant: UploadExcelFileVariant;
}) {
  const { setAlert } = useQuizSetState.getState();
  const onDropHandler = async (acceptedFiles: File[]) => {
    const handler = varinatHandlers[variant];
    if (!handler) {
      console.error(`Invalid variant: ${variant}`);
      return;
    }

    const processed = await Promise.all(
      acceptedFiles.map(handler.handleUpload)
    );

    handler.setData({
      data: processed,
      files: acceptedFiles,
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
      maxFiles: variant === 'quiz' ? undefined : 1,
      multiple: variant === 'quiz' ? true : false,
      onDropRejected: (rejectedFiles) => {
        if (
          variant !== 'quiz' &&
          rejectedFiles.some((file) =>
            file.errors.some((error) => error.code === 'too-many-files')
          )
        ) {
          // 재사용되는 컴포넌트를 사용하려면?
          setAlert('여러개의 파일을 업로드 할 수 없습니다.');
        }
      },
    });

  return {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
    fileRejections,
  };
}
