export const downloadFileByBase64 = ({
  base64,
  mimeType,
  filename,
}: {
  base64: string;
  mimeType: string;
  filename: string;
}) => {
  // 1️⃣ Base64 데이터를 Blob으로 변환
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  // 2️⃣ Blob 데이터를 브라우저에서 다운로드 처리
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 3️⃣ 메모리 해제
  window.URL.revokeObjectURL(blobUrl);
};
