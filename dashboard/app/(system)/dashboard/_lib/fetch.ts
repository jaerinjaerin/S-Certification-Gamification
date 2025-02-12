import axios from 'axios';
import { serializeJsonToQuery } from './search-params';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetchData = async (
  fieldValues: Record<string, any>,
  urlIdentifier: string,
  callback: (data: any) => void,
  controller: AbortController // 페이지별 컨트롤러 전달
) => {
  if (!fieldValues) return;

  try {
    const searchParams = serializeJsonToQuery(fieldValues);
    const url = `/api/dashboard/${urlIdentifier}?${searchParams.toString()}`;

    const response = await axios.get(url, {
      signal: controller.signal, // AbortController 적용
    });

    // 요청이 취소되었는지 확인 후 실행
    if (!controller.signal.aborted) {
      callback(response.data); // 데이터 반환
    }
  } catch (error: any) {
    if (axios.isCancel(error)) {
      console.log('canceled request:', error.message);
      return;
    }
    console.error('Error fetching data:', error);
  }
};
