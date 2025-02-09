/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ExcelJS from 'exceljs';

type Props<T> = {
  sheetName: string;
  columns: { header: string; key: keyof T; width: number }[];
  data: T[];
};

export const createNormalExcelBlob = async <T>({
  sheetName,
  columns,
  data,
}: Props<T>) => {
  // Creating a new Excel workbook and sheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Setting up columns with headers and width
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key as string,
    width: col.width,
  }));

  // Populating rows with data dynamically
  data.forEach((row, index) => {
    const rowData: { [key: string]: any } = {};
    columns.forEach((col) => {
      rowData[col.key as string] = row[col.key];
    });
    worksheet.addRow(rowData);
  });

  // Formatting the columns for better readability
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.font = { name: 'Arial', size: 10 };
    });

    if (rowNumber === 1) {
      // Apply bold font to the header row
      row.font = { name: 'Arial', size: 10, bold: true };
    }
  });

  // Generating the Excel file and saving it to buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Returning the Excel file as a Blob
  return new Blob([buffer], { type: 'application/octet-stream' });
};

export type OverviewExcelDataProps = {
  region: string;
  subsidiary: string | null;
  country: string | null;
  target: number;
  progress: number;
  percentage: number;
  sPlus: number;
  nonSPlus: number;
  numFSMs: number;
  ses: number;
  cnr: number;
  numFieldForce: number;
  sesFieldForce: number;
  nonSesFieldForce: number;
};

export const createOverviewExcelBlob = async (
  data: OverviewExcelDataProps[]
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Certification Status', {
    views: [{ showGridLines: true }],
  });

  // 헤더 정의
  sheet.columns = [
    { header: 'Region', key: 'region', width: 20 },
    { header: 'Subsidiary', key: 'subsidiary', width: 20 },
    { header: 'Country', key: 'country', width: 20 },
    { header: 'Target', key: 'target', width: 10 },
    { header: 'Progress', key: 'progress', width: 10 },
    { header: 'Percentage (%)', key: 'percentage', width: 15 },
    { header: 'S+', key: 'sPlus', width: 10 },
    { header: 'Non-S+', key: 'nonSPlus', width: 10 },
    { header: '# of FSMs', key: 'numFSMs', width: 10 },
    { header: 'SES', key: 'ses', width: 10 },
    { header: 'C&R', key: 'cnr', width: 10 },
    { header: '# of Field Force', key: 'numFieldForce', width: 15 },
    { header: 'SES Field Force', key: 'sesFieldForce', width: 15 },
    { header: 'Non-SES Field Force', key: 'nonSesFieldForce', width: 20 },
  ];

  let currentRegionName = '';
  data = data.map((item, index) => {
    if (item.country) {
      item.subsidiary = item.country;
      item.country = ' ';
    }

    if (currentRegionName === item.region) {
      item.region = ' ';
    } else {
      currentRegionName = item.region;
    }

    return item;
  });

  // 데이터 삽입
  data.forEach((item) => {
    sheet.addRow(item);
  });

  // 데이터 포맷 및 스타일 적용
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      const columnKey = sheet.getColumn(colNumber).key;

      // 정렬 및 폰트 설정
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.font = { name: 'Arial', size: 10 };

      // 숫자 포맷 지정
      if (typeof cell.value === 'number') {
        if (columnKey === 'percentage') {
          cell.numFmt = '0.00%'; // 퍼센트 포맷
        } else {
          cell.numFmt = '#,##0'; // 일반 숫자 포맷
        }
      }
    });

    // 헤더 스타일 적용
    if (rowNumber === 1) {
      row.font = { bold: true };
      row.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  // 그룹핑 (Subsidiary 기준, country가 ' '인 경우만 그룹화)
  let groupStartRow = 2;
  let currentSubsidiary = data[0].subsidiary;
  data.forEach((item, index) => {
    const isLastRow = index === data.length - 1;

    if (item.subsidiary !== currentSubsidiary || isLastRow) {
      const endRow = isLastRow ? index + 2 : index + 1;

      // 그룹 설정 (country가 ' '인 경우에만)
      sheet.getRows(groupStartRow, endRow)?.forEach((row) => {
        if (row.getCell('C').value === ' ') {
          row.outlineLevel = 1;
        }
      });

      groupStartRow = index + 2;
      currentSubsidiary = item.subsidiary;
    }
  });

  // target 그룹핑
  sheet.getColumn(4).outlineLevel = 1;
  //
  // 열 그룹핑 설정 (# of FSMs ~ Non-SES Field Force)
  for (let colIndex = 9; colIndex <= 14; colIndex++) {
    sheet.getColumn(colIndex).outlineLevel = 1; // 그룹 레벨 지정
  }

  // 조건부 스타일 적용 (Region 이름에 TTL 포함 시)
  sheet.eachRow((row, rowNumber) => {
    const regionCell = row.getCell('A');

    if (
      regionCell.value &&
      typeof regionCell.value === 'string' &&
      regionCell.value !== 'Global' &&
      regionCell.value !== 'Region'
    ) {
      if (regionCell.value.includes('TTL')) {
        // 모든 셀에 스타일 적용
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'BDD7EE' },
          };
          cell.font = { bold: true };
        });
      } else {
        regionCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'DDEBF7' },
        };
        regionCell.font = { bold: true };
      }
      //
    }
  });

  // 국가 스타일
  sheet.eachRow((row, rowNumber) => {
    const regionCell = row.getCell('C');

    if (regionCell.value && typeof regionCell.value === 'string') {
      // 모든 셀에 스타일 적용
      row.eachCell((cell, colNumber) => {
        if (colNumber >= 2) {
          if (!cell.fill) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F2F2F2' },
            };
          }
        }
      });
    }
  });

  // Generate Excel file as Blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/octet-stream' });
};
