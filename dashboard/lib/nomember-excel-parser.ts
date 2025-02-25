import { ERROR_CODES, ErrorCode } from '@/app/constants/error-codes';
import * as XLSX from 'xlsx';

interface ExcelRow {
  DomainCode: string;
  DomainId: string;
  Domain: string;
  RegionId: string;
  SubsidiaryId: string;
  ChannelName: string;
  JobId: string;
  JobName: string;
  JobGroup: string;
  ChannelId: string;
  ChannelSegmentId: string;
}

interface ChannelData {
  name: string;
  job: {
    id: string;
    name: string;
    group: string;
  };
  channelId: string;
  channelSegmentId: string;
}

export interface DomainData {
  id: string;
  name: string;
  code: string;
  regionId: string;
  subsidiaryId: string;
  channels: ChannelData[];
}

export interface ProcessResult {
  success: boolean;
  result?: {
    domainDatas: DomainData[];
  };
  error?: {
    message: string;
    code: ErrorCode;
  };
}

/**
 * 파일 버퍼(Buffer 또는 ArrayBuffer)를 받아 XLSX 데이터를 파싱 후,
 * DomainCode 기준으로 그룹화하여 JSON 배열을 반환하는 함수
 * @param fileBuffer XLSX 파일 데이터가 담긴 버퍼
 * @returns DomainData[] - 그룹화된 JSON 배열
 */
export function parseExcelBufferToDomainJson(
  fileBuffer: Buffer | ArrayBuffer
): ProcessResult {
  try {
    // 파일 버퍼 타입에 따라 XLSX에서 사용 가능한 타입을 결정합니다.
    const type: 'buffer' | 'array' =
      fileBuffer instanceof Buffer ? 'buffer' : 'array';

    // XLSX로 워크북을 읽어옵니다.
    const workbook = XLSX.read(fileBuffer, { type });
    // 첫 번째 시트를 사용한다고 가정합니다.
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 시트를 JSON 배열로 변환합니다.
    const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    const domainMap: { [key: string]: DomainData } = {};

    rows.forEach((row) => {
      const domainCode = row.DomainCode;
      if (!domainMap[domainCode]) {
        domainMap[domainCode] = {
          id: row.DomainId || '',
          name: row.Domain,
          code: domainCode,
          regionId: row.RegionId,
          subsidiaryId: row.SubsidiaryId,
          channels: [],
        };
      }

      const channelSegmentId = (row.ChannelSegmentId ?? '').toString();
      let channelId = null;
      if (channelSegmentId === '1') {
        channelId = '1';
      } else if (
        channelSegmentId === '2' ||
        channelSegmentId === '3' ||
        channelSegmentId === '4'
      ) {
        channelId = '2';
      } else if (channelSegmentId === '5') {
        channelId = '3';
      }

      const channel: ChannelData = {
        name: row.ChannelName,
        job: {
          id: (row.JobId ?? '').toString(),
          name: row.JobGroup,
          group: row.JobGroup,
        },
        channelId: channelId ?? '',
        channelSegmentId: channelSegmentId,
      };

      domainMap[domainCode].channels.push(channel);
    });

    return {
      success: true,
      result: {
        domainDatas: Object.values(domainMap),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: '엑셀 파일을 파싱하는 중 오류가 발생했습니다.',
        code: ERROR_CODES.UNKNOWN,
      },
    };
  }
}
