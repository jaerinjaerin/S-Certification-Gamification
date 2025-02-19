export function isEmpty(value: unknown) {
  if (value === null) return true;
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return !value;
}

export async function fetchBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch the URL: ${url} - Status: ${response.status}`
      );
    }
    return await response.blob();
  } catch (error) {
    console.error('Error fetching the Blob:', error);
    return null;
  }
}

export function createBlobURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export async function getDownloadDataURL(url: string) {
  const blob = await fetchBlob(url);
  if (blob) {
    const blobURL = createBlobURL(blob);
    return blobURL;
  } else {
    console.log('Failed to create Blob URL.');
    return null;
  }
}

export async function handleDownload(fileName: string, imageUrl: string) {
  const downloadDataUrl = await getDownloadDataURL(imageUrl);
  if (!downloadDataUrl) return; // Exit if null

  const a = document.createElement('a');
  a.href = downloadDataUrl;
  a.download = fileName ?? 'download';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
