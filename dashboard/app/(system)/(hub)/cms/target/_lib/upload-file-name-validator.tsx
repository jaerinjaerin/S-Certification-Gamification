type ValidatorResult = {
  file: File;
  metadata?: { hasError: boolean; code?: string; errorMessage?: string };
  errors?: { code: string; message: string }[];
};

export const uploadFileNameValidator = (file: File) => {
  const errorResult = (message: string): ValidatorResult => ({
    file,
    metadata: {
      hasError: true,
    },
    errors: [{ code: 'invalid-file-name', message }],
  });

  const successResult: ValidatorResult = {
    file,
    metadata: {
      hasError: false,
    },
  };

  const fileName = file.name.toLowerCase();

  const isValid = /^target$|^target_.*$/i.test(fileName);

  return isValid ? successResult : errorResult('Invalid target file name.');
};
