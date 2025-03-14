import {
  CustomDialogContent,
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropzoneProps, FileWithExtraInfo } from '../../_types/type';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { LoadingFullScreen } from '@/components/loader';
import dayjs from 'dayjs';

type OptionalDropzoneProps = Omit<
  DropzoneProps,
  'getRootProps' | 'isDragActive'
>;
type PreviewDialogProps = OptionalDropzoneProps & {
  children: React.ReactNode;
  modalOpen?: boolean;
  type: 'add' | 'edit';
  files: FileWithExtraInfo[];
  loading: boolean;
  onSave: () => void;
  onClear: () => void;
  onDownload?: () => void;
};

export function PreviewDialog({
  children,
  modalOpen,
  type,
  files,
  open,
  getInputProps,
  loading,
  onSave,
  onClear,
  onDownload,
}: PreviewDialogProps) {
  const isFileInstance = files[0] instanceof File;

  const [status, setStatus] = useState(modalOpen);
  return (
    <Dialog
      open={status}
      onOpenChange={(open) => {
        setStatus(open);
        if (!open) {
          onClear();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <CustomDialogContent
        className="p-10 gap-[2.625rem]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {loading && <LoadingFullScreen />}
        <DialogHeader>
          <DialogTitle className="text-size-24px font-medium ">
            {type === 'add' ? 'Add Asset' : 'Edit Asset'}
          </DialogTitle>
        </DialogHeader>
        {type === 'add' ? (
          <AddAssetPreviewView
            files={files}
            open={open}
            getInputProps={getInputProps}
          />
        ) : (
          <EditAssetPreviewView
            getInputProps={getInputProps}
            open={open}
            files={files}
            onDownload={onDownload}
          />
        )}

        <DialogFooter className="sm:items-center sm:justify-center gap-5">
          <DialogClose asChild>
            <Button variant="secondary" onClick={onClear}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={!isFileInstance}
            className="!m-0 shadow-none"
            variant="action"
            onClick={onSave}
          >
            Save
          </Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}

type AssetPreviewViewProps = {
  files: FileWithExtraInfo[];
  open: () => void;
  extraContent?: React.ReactNode;
  onDownload?: () => void;
} & Pick<DropzoneProps, 'getInputProps'>;

function AssetPreviewView({
  extraContent,
  getInputProps,
  files,
  open,
}: AssetPreviewViewProps) {
  return (
    <div className="mx-auto w-full max-w-[25rem]">
      <p className="text-secondary">Asset File</p>
      <div className="mt-2 flex justify-center">
        {files?.map((file) => (
          <div key={file.name} className="w-full">
            <div className="mb-[2.625rem] flex flex-col gap-3">
              <div className="flex justify-center gap-2 max-h-10">
                <div>
                  <input {...getInputProps()} />
                  <Button
                    variant={'secondary'}
                    className="h-full border-zinc-200 shadow-none text-zinc-950"
                    onClick={open}
                  >
                    Upload
                  </Button>
                </div>

                <div className="grow w-full">
                  <div className="size-full border flex items-center border-zinc-200 rounded-md overflow-hidden p-3 font-medium text-size-14px text-zinc-950">
                    {file.name}
                  </div>
                </div>
              </div>

              {extraContent && <div className="ml-auto">{extraContent}</div>}
            </div>

            <div className="w-full rounded-md border border-zinc-600 aspect-video bg-[url(https://assets-stage.samsungplus.net/certification/common/images/bg_transparent_grid.png)] bg-cover">
              <img
                src={file.preview}
                alt={file.name}
                className="object-contain size-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddAssetPreviewView(
  props: Omit<AssetPreviewViewProps, 'extraContent' | 'onDownload'>
) {
  return <AssetPreviewView {...props} />;
}

function EditAssetPreviewView(
  props: Omit<AssetPreviewViewProps, 'extraContent'>
) {
  const { onDownload, ...restProps } = props;
  const timestamp = props.files[0].lastModified;
  const date = dayjs(timestamp).format('YY.MM.DD HH:mm:ss');

  const isFileInstance = props.files[0] instanceof File;

  return (
    <AssetPreviewView
      {...restProps}
      extraContent={
        !isFileInstance && (
          <div className="flex items-center gap-2">
            <span>{date}</span>
            <Button
              variant="download"
              className="shadow-none"
              size="icon"
              onClick={onDownload}
            >
              <Download />
            </Button>
          </div>
        )
      }
    />
  );
}
