'use client';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadFilesDialog } from '../../_components/upload-files-dialog';
import { PreviewDialog } from './preivew-dialog';
import axios from 'axios';
import { isEmpty } from '../../_utils/utils';
import { useMediaData } from '../_provider/media-data-provider';
import { CustomAlertDialog } from '../../_components/custom-alert-dialog';
import { FileWithExtraInfo } from '../../_types/type';
import { useStateVariables } from '@/components/provider/state-provider';

export function UploadImageFileModal({
  children,
  group,
  id,
  preview,
}: {
  children: React.ReactNode;
  group: MediaGroupName;
  id?: string | null;
  preview?: [string | null, Dispatch<SetStateAction<string | null>>];
}) {
  const { campaign } = useStateVariables();
  const { state, dispatch } = useMediaData();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileWithExtraInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 기존 이미지가 있을 경우 files 상태에 추가
  useEffect(() => {
    if (preview && preview[0] && id) {
      const previewFile: FileWithExtraInfo = {
        name: 'Preview Image',
        preview: preview[0],
        size: 0,
        type: 'image/jpeg',
        lastModified: Date.now(),
      } as FileWithExtraInfo;
      setFiles([previewFile]);
    }

    return () => {
      if (preview) {
        preview[1](null);
      }
    };
  }, [preview, id]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      )
    );
  }, []);

  const { getRootProps, getInputProps, open, isDragActive, fileRejections } =
    useDropzone({
      accept: { 'image/jpeg': [], 'image/png': [] },
      onDrop,
      multiple: false,
      noClick: true,
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
        insertData(response.data.result);
      } catch (error) {
        console.error('Upload failed:', error);
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
      } catch (error) {
        console.error('Update failed:', error);
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
          onSave={handleSave}
          onClear={handleClear}
        >
          {children}
        </PreviewDialog>
      )}

      <CustomAlertDialog
        open={isOpen}
        className="max-w-[20rem]"
        description="The uploaded file does not match the required format."
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
