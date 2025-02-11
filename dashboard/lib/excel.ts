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
      cell.font = { name: 'Arial', size: 11 };
    });

    if (rowNumber === 1) {
      // Apply bold font to the header row
      row.font = { name: 'Arial', size: 11, bold: true };
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
  let currentRegionName = '';
  data = data.map((item, index) => {
    if (item.country) {
      item.subsidiary = `  ${item.country}`;
      item.country = ' ';
    }

    if (currentRegionName === item.region) {
      item.region = ' ';
    } else {
      currentRegionName = item.region;
    }

    return item;
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Certification Status', {});

  sheet.mergeCells('F2:F3'); // Percentage (%)
  sheet.mergeCells('G2:G3'); // S+
  sheet.mergeCells('H2:H3'); // Non-S+
  sheet.mergeCells('I2:K2'); // # of FSMs
  sheet.mergeCells('L2:N2'); // # Field Force group

  // 병합된 셀에 텍스트 삽입
  const customHeaders = [
    { cell: 'A2', value: 'Region' },
    { cell: 'B2', value: 'Subsidiary' },
    { cell: 'C2', value: 'Country' },
    { cell: 'D2', value: 'Target' },
    { cell: 'E2', value: 'Progress' },
    { cell: 'F2', value: '(%)' },
    { cell: 'G2', value: 'S+' },
    { cell: 'H2', value: 'Non-S+' },
    { cell: 'I2', value: '#of FSMs' },
    { cell: 'J3', value: 'SES' },
    { cell: 'K3', value: 'C&R' },
    { cell: 'L2', value: '#of Field Force' },
    { cell: 'M3', value: 'SES' },
    { cell: 'N3', value: 'Non-SES' },
  ];

  customHeaders.forEach(({ cell, value }) => {
    const exception = cell === 'L2' || cell === 'I2';
    const headerCell = sheet.getCell(cell);
    headerCell.value = value;
    headerCell.font = exception ? {} : { bold: true, name: 'Arial', size: 11 };
    headerCell.alignment = {
      vertical: 'middle',
      horizontal: exception ? 'left' : 'center',
    };
  });

  // 2. 나머지 열은 sheet.columns로 정의
  sheet.columns = [
    {
      key: 'region',
      width: 20,
    },
    {
      key: 'subsidiary',
      width: 30,
    },
    {
      key: 'country',
      width: 20,
    },
    {
      key: 'target',
      width: 10,
    },
    {
      key: 'progress',
      width: 10,
    },
    {
      key: 'percentage',
      width: 15,
    },
    {
      key: 'sPlus',
      width: 10,
    },
    {
      key: 'nonSPlus',
      width: 10,
    },
    {
      key: 'numFSMs',
      width: 10,
    },
    {
      key: 'ses',
      width: 10,
    },
    {
      key: 'cnr',
      width: 10,
    },
    {
      key: 'numFieldForce',
      width: 15,
    },
    {
      key: 'sesFieldForce',
      width: 15,
    },
    {
      key: 'nonSesFieldForce',
      width: 20,
    },
  ];

  // 3. 데이터 삽입 (A4부터)
  data.forEach((item) => {
    sheet.addRow([
      item.region,
      item.subsidiary,
      item.country,
      item.target,
      item.progress,
      item.percentage,
      item.sPlus,
      item.nonSPlus,
      item.numFSMs,
      item.ses,
      item.cnr,
      item.numFieldForce,
      item.sesFieldForce,
      item.nonSesFieldForce,
    ]);
  });

  // 데이터 포맷 및 스타일 적용
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (rowNumber >= 4) {
      row.eachCell((cell, colNumber) => {
        const columnKey = sheet.getColumn(colNumber).key;
        let horizontal: 'left' | 'right' = 'right';
        // 숫자 포맷 지정
        if (typeof cell.value === 'number') {
          if (columnKey === 'percentage') {
            cell.numFmt = '0.00%'; // 퍼센트 포맷
          } else {
            cell.numFmt = '#,##0'; // 일반 숫자 포맷
          }
        } else {
          if (!cell.fill) {
            horizontal = 'left';
          }
        }
        cell.alignment = { vertical: 'middle', horizontal };
        cell.font = { name: 'Arial', size: 11 };
      });
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
          cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
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

    if (regionCell.value === 'Global') {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
        cell.font = { bold: true };
      });
    }
  });

  // 국가 스타일
  sheet.eachRow((row, rowNumber) => {
    const countryCell = row.getCell('C');

    if (countryCell.value && countryCell.value === ' ') {
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

  // 데이터의 시작 행 및 마지막 행 계산
  const startRow = 1; // 데이터는 B4부터 시작
  const headerRow = 3; // 데이터는 B4부터 시작
  const endRow = startRow + headerRow + data.length - 1; // 데이터의 마지막 행 (데이터 갯수에 따라 달라짐)
  const startColumn = 1; // B열
  const endColumn = 14; // 마지막 열 번호 (N열, 실제 컬럼 개수에 맞게 조정)

  // 겉 테두리 적용
  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
    const cellFirst = sheet.getCell(rowIndex, 1);
    cellFirst.border = { ...cellFirst.border, left: { style: 'thin' } };
    const cellEnd = sheet.getCell(rowIndex, 14);
    cellEnd.border = { ...cellEnd.border, right: { style: 'thin' } };
  }

  for (let colIndex = startColumn; colIndex <= endColumn; colIndex++) {
    const rowTop = sheet.getCell(startRow, colIndex);
    rowTop.border = { ...rowTop.border, top: { style: 'thin' } };
    const rowBottom = sheet.getCell(endRow, colIndex);
    rowBottom.border = { ...rowBottom.border, bottom: { style: 'thin' } };
  }

  // Generate Excel file as Blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/octet-stream' });
};
