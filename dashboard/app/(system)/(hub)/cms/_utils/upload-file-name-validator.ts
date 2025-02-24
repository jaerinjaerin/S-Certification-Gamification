import { UploadExcelFileVariant } from '../_types/type';

export const uploadFileNameValidator = (
  file: File,
  variant: UploadExcelFileVariant,
  campaign?: string
) => {
  const fileName = file.name?.replace(/\.[^/.]+$/, '');

  // variant에 따라 파일 이름 검증 로직 추가
  if (variant === 'quiz') {
    const quizRegex =
      /^qs_\{[a-zA-Z0-9_]+\}_\{[a-zA-Z0-9-]+\}_\{[a-zA-Z]+\}(_\{[a-zA-Z0-9_-]+\})?$/;

    if (!quizRegex.test(fileName)) {
      return {
        code: 'invalid-file-name',
        message:
          'Invalid Quiz file name. Format: qs_{DomainCode}_{LanguageCode}_{JobGroup}_{version}',
      };
    }
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
    if (
      !file.name.toLowerCase().includes(`target_${campaign?.toLowerCase()}`)
    ) {
      return {
        code: 'invalid-file-name',
        message:
          'Invalid Target file name. Format: target_{campaignName}_{version}',
      };
    }
  }

  return null;
};
