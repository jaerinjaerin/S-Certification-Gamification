import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DropzoneProps } from '../../_types/type';

type DataUploadDialogProps = DropzoneProps & {
  children: React.ReactNode;
  title: string;
};

export function UploadFilesDialog({
  children,
  title,
  getRootProps,
  getInputProps,
  isDragActive,
  open,
}: DataUploadDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DropzoneView
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          open={open}
        />
      </DialogContent>
    </Dialog>
  );
}

export function DropzoneView({
  getRootProps,
  getInputProps,
  isDragActive,
  open,
}: DropzoneProps) {
  return (
    <div className="border border-dashed rounded-md mt-12">
      <div
        {...getRootProps()}
        className="h-[18.75rem] flex items-center justify-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p className="flex flex-col items-center space-y-8">
            <span>Drag & Drop here or</span>
            <Button onClick={open}>Browse files</Button>
          </p>
        )}
      </div>
    </div>
  );
}
