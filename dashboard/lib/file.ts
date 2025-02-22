/* eslint-disable @typescript-eslint/no-explicit-any */
export const jsonToFile = ({
  filename,
  json,
}: {
  filename: string;
  json: Record<string, any>;
}) => {
  const jsonString = JSON.stringify(json, null, 2);
  return new File([jsonString], filename, {
    type: 'application/json',
  });
};

// 기준 키 경로
export const getPath = (campaignName: string, folderName: string) => {
  return `certification/${campaignName}/${folderName}`;
};
