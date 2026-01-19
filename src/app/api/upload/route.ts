export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Upload service is currently disabled.' },
    { status: 503 }
  );
}
