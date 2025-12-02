import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error create campaign: ', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
