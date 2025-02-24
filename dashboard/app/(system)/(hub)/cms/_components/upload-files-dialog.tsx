import {
  CustomDialogContent,
  Dialog,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropzoneProps } from '../_types/type';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
      <CustomDialogContent
        className="gap-16"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="!flex-row !items-center justify-between">
          <DialogTitle className="text-size-17px font-semibold">
            {title}
          </DialogTitle>
          <DialogClose>
            <X />
          </DialogClose>
        </DialogHeader>
        <DropzoneView
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          open={open}
        />
      </CustomDialogContent>
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
    <div className="border border-dashed rounded-md">
      <div
        {...getRootProps()}
        className="h-[18.813rem] flex items-center justify-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p className="flex flex-col items-center gap-8">
            <span className="font-medium">Drag & Drop here or</span>
            <Button onClick={open}>Browse files</Button>
          </p>
        )}
      </div>
    </div>
  );
}
