import { UploadExcelFileVariant } from '../_types/type';

export const uploadFileNameValidator = (
  file: File,
  variant: UploadExcelFileVariant
) => {
  const fileName = file.name.replace(/\.[^/.]+$/, '');
  console.log('fileName', fileName);
  // variant에 따라 파일 이름 검증 로직 추가
  if (variant === 'quiz') {
  }

  if (variant === 'ui') {
    const uiRegex = /^ui_[a-zA-Z-]+(_[a-zA-Z0-9]+)?$/;
    if (!uiRegex.test(fileName)) {
      return {
        code: 'invalid-file-name',
        message: 'Invalid UI file name. Format: ui_{UiLanguageCode}_{version}',
      };
    }
  }
  if (variant === 'target') {
    if (!file.name.startsWith('target')) {
      return {
        code: 'invalid-file-name',
        message: 'Invalid file name',
      };
    }
  }

  return null;
};
