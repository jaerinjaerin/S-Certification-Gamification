export async function handleUpload(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/cms/media', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data; // 업로드된 파일 정보 반환
  } catch (error) {
    console.error('Upload Error:', error);
    return null;
  }
}
