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

type OptionalDropzoneProps = Omit<
  DropzoneProps,
  'getRootProps' | 'isDragActive'
>;
type PreviewDialogProps = OptionalDropzoneProps & {
  children: React.ReactNode;
  clearFiles: () => void;
  modalOpen?: boolean;
  type: 'add' | 'edit';
  files: FileWithPreview[];
};

export function PreviewDialog({
  children,
  clearFiles,
  modalOpen,
  type,
  files,
  open,
  getInputProps,
}: PreviewDialogProps) {
  console.log('🥕 files', files);
  return (
    <Dialog open={modalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
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
            <Button variant="secondary" onClick={clearFiles}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="action"
            onClick={() => console.log('TODO: 이미지 폼데이터로 전송')}
          >
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
