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

export type FileWithExtraInfo = File & {
  preview?: string;
  hasError?: boolean;
  errorMessage?: string;
  transformedData?: Record<string, string>;
};

export type DropzoneProps = {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: () => DropzoneInputProps;
  open: () => void;
  isDragActive?: boolean;
};
