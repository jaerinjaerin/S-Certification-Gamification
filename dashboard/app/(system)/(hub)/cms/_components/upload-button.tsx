'use client';

import { Button } from '@/components/ui/button';
import UploadExcelFileModal from './upload-excel-file-modal';
import { UploadExcelFileVariant } from '../_types/type';

export default function UploadButton({
  title,
  buttonText,
  variant,
}: {
  title: string;
  buttonText: string;
  variant: UploadExcelFileVariant;
}) {
  return (
    <UploadExcelFileModal title={title} variant={variant}>
      <Button variant="action">{buttonText}</Button>
    </UploadExcelFileModal>
  );
}
