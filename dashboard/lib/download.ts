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

export const downloadFileByUrl = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to download file');

    const blob = await response.blob();
    const fileUrl = window.URL.createObjectURL(blob);

    // ✅ 파일명 추출 (서버에서 `Content-Disposition` 헤더 제공 시)
    const disposition = response.headers.get('Content-Disposition');
    let filename = 'downloaded-file'; // 기본 파일명

    if (disposition) {
      const match = disposition.match(/filename="(.+)"/);
      if (match && match[1]) filename = match[1]; // 서버에서 받은 파일명 적용
    }

    // ✅ 가짜 <a> 태그를 생성하여 다운로드 트리거
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // ✅ 메모리 해제
    window.URL.revokeObjectURL(fileUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download failed:', error);
  }
};
