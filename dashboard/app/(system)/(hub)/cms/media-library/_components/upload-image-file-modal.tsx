'use client';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { UploadFilesDialog } from '../../_components/upload-files-dialog';
import { PreviewDialog } from './preivew-dialog';
import axios from 'axios';
import { handleDownload, isEmpty } from '../../_utils/utils';
import { useMediaData } from '../_provider/media-data-provider';
import { CustomAlertDialog } from '../../_components/custom-alert-dialog';
import { FileWithExtraInfo } from '../../_types/type';
import { useStateVariables } from '@/components/provider/state-provider';
import { toast } from 'sonner';

export function UploadImageFileModal({
  children,
  group,
  id,
  preview,
}: {
  children: React.ReactNode;
  group: MediaGroupName;
  id?: string | null;
  preview?: [
    MediaPreviewProps | null,
    Dispatch<SetStateAction<MediaPreviewProps | null>>,
  ];
}) {
  const { campaign } = useStateVariables();
  const { state, dispatch } = useMediaData();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileWithExtraInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const BADGE_MAX_SIZE = 70 * 1024; // 90kb
  const CHARACTER_MAX_SIZE = 200 * 1024; // 200kb

  // const MAX_WIDTHS = {
  //   badge: 300,
  //   character: 960,
  //   background: 960,
  // };

  // 연필 클릭 에디트 모드일 때 데이터에 저장된 URL을 파일처럼 적용
  useEffect(() => {
    if (preview && preview[0] && id) {
      const previewFile: FileWithExtraInfo = {
        name: preview[0].fileName,
        preview: preview[0].imageUrl,
        size: 0,
        type: 'image/png',
        lastModified: new Date(preview[0].updatedAt).getTime(),
      } as FileWithExtraInfo;
      setFiles([previewFile]);
    }

    return () => {
      if (preview) {
        preview[1](null);
      }
    };
  }, [preview, id]);

  // const getDimensionErrorMessage = (group: MediaGroupName) => {
  //   switch (group) {
  //     case 'badge':
  //       return `Maximum Badge image width: ${MAX_WIDTHS.badge}px`;
  //     case 'character':
  //       return `Maximum Character image width: ${MAX_WIDTHS.character}px`;
  //     case 'background':
  //       return `Maximum Background image width: ${MAX_WIDTHS.background}px`;
  //     default:
  //       return 'Invalid image dimensions';
  //   }
  // };

  // const checkImageDimensions = (file: File): Promise<boolean> => {
  //   return new Promise((resolve) => {
  //     const img = new Image();
  //     img.src = URL.createObjectURL(file);
  //     img.onload = () => {
  //       URL.revokeObjectURL(img.src);
  //       resolve(img.width <= MAX_WIDTHS[group]);
  //     };
  //   });
  // };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // for (const file of acceptedFiles) {
      // const isValidDimension = await checkImageDimensions(file);
      // if (!isValidDimension) {
      //   setErrors([getDimensionErrorMessage(group)]);
      //   setIsOpen(true);
      //   return;
      // }
      // }

      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        )
      );
    },
    [group]
  );

  const onDropRejected = (fileRejections: FileRejection[]) => {
    const getErrorMessage = (code: string) => {
      switch (code) {
        case 'file-invalid-type':
          return 'The uploaded file does not match the required format.';
        case 'file-too-large':
          return 'Some files exceed the maximum size limit.\n- Badge must be 70KB or less\n- Other Images must be 200KB or less';

        case 'too-many-files':
          return 'Only one file can be uploaded.';
        default:
          return 'Invalid file format';
      }
    };

    setErrors([
      ...new Set(
        fileRejections.map((file) => getErrorMessage(file.errors[0].code))
      ),
    ]);
  };

  const { getRootProps, getInputProps, open, isDragActive, fileRejections } =
    useDropzone({
      accept: { 'image/jpeg': [], 'image/png': [] },
      onDrop,
      multiple: false,
      noClick: true,
      onDropRejected,
      maxSize: group === 'badge' ? BADGE_MAX_SIZE : CHARACTER_MAX_SIZE,
    });

  useEffect(() => {
    if (fileRejections.length > 0) {
      setIsOpen(true);
    }
  }, [fileRejections]);

  useEffect(() => {
    return () =>
      files.forEach(
        (file) => file.preview && URL.revokeObjectURL(file.preview)
      );
  }, [files]);

  const insertData = (addData: MediaProps) => {
    const data = state[group] || [];
    const count = data?.length ?? 0;
    addData.index = count + 1;
    const newData = addData;

    switch (group) {
      case 'badge':
        dispatch({ type: 'SET_BADGE', payload: [...data, newData] });
        break;
      case 'character':
        dispatch({ type: 'SET_CHARACTER', payload: [...data, newData] });
        break;
      case 'background':
        dispatch({ type: 'SET_BACKGROUND', payload: [...data, newData] });
        break;
    }
  };

  const updateData = (updatedItem: MediaProps) => {
    const data = state[group] || [];

    // 특정 `id`를 가진 항목만 업데이트하고 나머지는 그대로 유지
    const updatedData = data.map((item) =>
      item.id === updatedItem.id ? { ...item, ...updatedItem } : item
    );

    switch (group) {
      case 'badge':
        dispatch({ type: 'SET_BADGE', payload: updatedData });
        break;
      case 'character':
        dispatch({ type: 'SET_CHARACTER', payload: updatedData });
        break;
      case 'background':
        dispatch({ type: 'SET_BACKGROUND', payload: updatedData });
        break;
    }
  };

  const handleSave = async () => {
    if (!group) return console.warn('Group is required');

    setLoading(true);

    const formData = new FormData();
    formData.append('group', group);

    if (!id) {
      // 추가 모드 (POST)
      if (files.length === 0)
        return console.warn('No file selected for upload');

      formData.append('file', files[0]);
      formData.append('campaign', JSON.stringify(campaign));

      try {
        const response = await axios.post('/api/cms/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('🚀 File uploaded:', response.data);
        toast.success('File uploaded successfully');
        insertData(response.data.result);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Upload failed: ${error}`);
      }
    } else {
      // 수정 모드 (PUT)
      if (files.length === 0)
        return console.warn('No file provided for update');

      formData.append('file', files[0]);
      formData.append('id', id);
      formData.append('group', group);

      try {
        const response = await axios.put('/api/cms/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('🚀 File updated:', response.data);
        updateData(response.data.result);
        toast.success('File updated successfully');
      } catch (error) {
        console.error('Update failed:', error);
        toast.error(`Update failed: ${error}`);
      }
    }

    setLoading(false);
    handleClear();
  };

  // clear list
  const handleClear = () => {
    setFiles([]);
  };

  return (
    <>
      {isEmpty(files) ? (
        <UploadFilesDialog
          title="Upload Asset"
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          open={open}
          description="Asset allows only one file to be uploaded at a time."
        >
          {children}
        </UploadFilesDialog>
      ) : (
        <PreviewDialog
          modalOpen={!isEmpty(files)}
          open={open}
          getInputProps={getInputProps}
          type={id ? 'edit' : 'add'}
          files={files}
          loading={loading}
          onDownload={() => {
            if (files.length > 0) {
              const file = files[0];
              if (file.preview) {
                const filename = `${group}_${file.name}.${file.type.split('/')[1]}`;
                handleDownload(filename, file.preview);
              }
            }
          }}
          onSave={handleSave}
          onClear={handleClear}
        >
          {children}
        </PreviewDialog>
      )}

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
