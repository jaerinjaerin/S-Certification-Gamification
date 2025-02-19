export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'action'
  | null
  | undefined;

export type FileWithPreview = File & {
  preview?: string;
};

export type DropzoneProps = {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: () => DropzoneInputProps;
  open: () => void;
  isDragActive?: boolean;
};
