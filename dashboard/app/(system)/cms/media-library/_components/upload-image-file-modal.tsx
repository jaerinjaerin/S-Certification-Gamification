import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileWithPreview } from '../../_types/type';
import { isEmpty } from '../../_utils/utils';
import { UploadFilesDialog } from '../../_components/upload-files-dialog';
import { PreviewDialog } from './preivew-dialog';

export function UploadImageFileModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  console.log('🥕 files', files);
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
    multiple: false,
    noClick: true,
    noKeyboard: false,
  });

  const clearFiles = () => {
    setFiles([]);
  };
  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () =>
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
  }, [files]);

  return (
    <>
      {isEmpty(files) ? (
        <UploadFilesDialog
          title="Asset Upload"
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
          clearFiles={clearFiles}
          type={'add'}
          open={open}
          getInputProps={getInputProps}
          files={files}
        >
          {children}
        </PreviewDialog>
      )}
    </>
  );
}
