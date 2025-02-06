/* eslint-disable @typescript-eslint/no-unused-vars */
export const dynamic = 'force-dynamic';
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '@/app/api/(system)/dashboard/_lib/query';
import { decrypt } from '@/utils/encrypt';
import * as ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, period } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    await prisma.$connect();

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    const logs = await prisma.userQuizLog.findMany({
      where: {
        ...where,
        jobId: { in: jobGroup.map((job) => job.id) },
        ...(storeId
          ? storeId === '4'
            ? { storeId }
            : { OR: [{ storeId }, { storeId: null }] }
          : {}),
      },
      select: { userId: true, lastCompletedStage: true },
    });

    const users = await prisma.user.findMany({
      where: {
        id: { in: logs.map((log) => log.userId) },
      },
      select: { id: true, providerUserId: true },
    });

    const userMap = new Map(
      users.map((user) => {
        const employeeId = user.providerUserId
          ? decrypt(user.providerUserId, true)
          : null;
        return [user.id, employeeId];
      })
    );

    const result = logs.map((log) => ({
      providerUserId: userMap.get(log.userId) || null,
      lastCompletedStage: log.lastCompletedStage
        ? log.lastCompletedStage + 1
        : 0,
    }));

    // Creating a new Excel workbook and sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Stage Progress');

    // Adding header row
    worksheet.columns = [
      { header: 'No', key: 'no', width: 10 },
      { header: 'Employee ID', key: 'eid', width: 50 },
      { header: 'Stage', key: 'stage', width: 30 },
    ];

    // Populating rows with data
    let no = 0;
    result.forEach((user) => {
      worksheet.addRow({
        no: ++no,
        eid: user.providerUserId,
        stage: user.lastCompletedStage,
      });
    });

    // Formatting the columns for better readability
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Arial', size: 12 };
      });

      if (rowNumber === 1) {
        // Apply bold font to the header row
        row.font = { name: 'Arial', size: 12, bold: true };
      }
    });

    // Generating the Excel file and saving
    const buffer = await workbook.xlsx.writeBuffer();

    // Downloading the file (if in React or browser environment)
    const blob = await new Blob([buffer], { type: 'application/octet-stream' });

    const { createdAt, campaignId, authType, ...args } = condition;
    const range = `${period.from.toISOString().split('T')[0]}_to_${period.to.toISOString().split('T')[0]}`;
    const filename = `user_stage_progress_data_${range}${args ? Object.values(args).reduce((acc, item) => `${acc}_${item}`, '') : ''}.xlsx`;

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}
