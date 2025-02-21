import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Dialog } from '@/components/ui/dialog';
import { FileWithPreview } from '../../_types/type';
import { DropzoneProps } from '../../_types/type';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { LoaderWithBackground } from '@/components/loader';

type OptionalDropzoneProps = Omit<
  DropzoneProps,
  'getRootProps' | 'isDragActive'
>;
type PreviewDialogProps = OptionalDropzoneProps & {
  children: React.ReactNode;
  modalOpen?: boolean;
  type: 'add' | 'edit';
  files: FileWithPreview[];
  loading: boolean;
  onSave: () => void;
  onClear: () => void;
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
}: PreviewDialogProps) {
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
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        {loading && <LoaderWithBackground />}
        <DialogHeader>
          <DialogTitle>
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
          />
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={onClear}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="action" onClick={onSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type AssetPreviewViewProps = {
  files: FileWithPreview[];
  open: () => void;
  extraContent?: React.ReactNode;
} & Pick<DropzoneProps, 'getInputProps'>;

function AssetPreviewView({
  extraContent,
  getInputProps,
  files,
  open,
}: AssetPreviewViewProps) {
  return (
    <div>
      <div>
        <input {...getInputProps()} />
        <Button onClick={open}>Upload</Button>
      </div>
      {extraContent && <div>{extraContent}</div>}
      <div>
        {files?.map((file) => (
          <div key={file.name}>
            <div>
              <input
                value={file.name}
                readOnly
                className="border border-zinc-200 rounded-lg overflow-hidden py-2 "
              />
            </div>
            <div className="aspect-video bg-red-400">
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
  props: Omit<AssetPreviewViewProps, 'extraContent'>
) {
  return <AssetPreviewView {...props} />;
}

function EditAssetPreviewView(
  props: Omit<AssetPreviewViewProps, 'extraContent'>
) {
  return (
    <AssetPreviewView
      {...props}
      extraContent={
        <div>
          <span>version: 25.02.05 23:55:23</span>
          <Button variant="download" size="icon">
            <Download />
          </Button>
        </div>
      }
    />
  );
}
