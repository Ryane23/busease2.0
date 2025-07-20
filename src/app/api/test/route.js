import { connectToDB } from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDB();
    return NextResponse.json({ success: true, message: '✅ Database connection successful' });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '❌ Database connection test failed',
      error: error.message
    }, { status: 500 });
  }
}
