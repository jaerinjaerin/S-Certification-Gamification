export async function handleNonSFileUpload(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (!event.target) return reject(new Error('Failed to read file'));
      const bufferArray = event.target.result;
      if (!(bufferArray instanceof ArrayBuffer)) {
        return reject(new Error('Failed to read file as ArrayBuffer'));
      }

      const result = {
        success: true,
        data: file,
      };

      resolve(result);
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

// const handleFileUpload = (event: any) => {
//   const file = event.target.files[0]; // 선택한 파일 가져오기
//   if (!file) return;

//   const reader = new FileReader();
//   reader.readAsArrayBuffer(file);

//   reader.onload = (e: any) => {
//     // const bufferArray = e.target.result;
//     // const result: ProcessResult = parseExcelBufferToDomainJson(bufferArray);
//     // console.log(result);

//     // if (result.result?.domainDatas) {
//     //   setData(result.result?.domainDatas);
//     // }
//     setFile(file);
//   };

//   reader.onerror = () => {
//     alert('파일을 읽는 중 오류가 발생했습니다.');
//   };
// };
