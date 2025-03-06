import { UploadExcelFileVariant } from '../_types/type';

type ValidatorResult = {
  file: File;
  metadata: { hasError: boolean; code?: string; errorMessage?: string };
};

export const uploadFileNameValidator = (
  file: File,
  variant: UploadExcelFileVariant,
  // variant: 'ui' | 'target',
  campaign?: string
) => {
  const fileName = file.name?.replace(/\.[^/.]+$/, '');

  const errorResult = (message: string): ValidatorResult => ({
    file,
    metadata: {
      hasError: true,
      code: 'invalid-file-name',
      errorMessage: message,
    },
  });

  const successResult: ValidatorResult = {
    file,
    metadata: {
      hasError: false,
    },
  };

  if (variant === 'ui') {
    const uiRegex = /^ui_[a-zA-Z-]+(_[a-zA-Z0-9]+)?$/;
    return uiRegex.test(fileName)
      ? successResult
      : errorResult(
          'Invalid UI file name. Format: ui_{UiLanguageCode}_{version}'
        );
  }

  if (variant === 'target') {
    return file.name.toLowerCase().includes(`target_${campaign?.toLowerCase()}`)
      ? successResult
      : errorResult(
          'Invalid Target file name. Format: target_{campaignName}_{version}'
        );
  }

  // This should never happen due to type safety, but TypeScript requires a return
  return errorResult('Invalid variant type');
};
