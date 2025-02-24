export type UploadExcelFileVariant = 'quiz' | 'activityId' | 'non-s';

export type UploadExcelFileModalProps = {
  children: React.ReactNode;
  title: string;
  variant: UploadExcelFileVariant;
};
