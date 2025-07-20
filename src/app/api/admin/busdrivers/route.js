import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BusDriver from '@/models/BusDriver';

// GET all bus drivers
export async function GET() {
  try {
    await dbConnect();
    const drivers = await BusDriver.find({});
    return NextResponse.json(drivers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bus drivers' }, { status: 500 });
  }
}

// CREATE a new bus driver
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const driver = await BusDriver.create(body);
    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bus driver' }, { status: 500 });
  }
}

// DELETE a bus driver by id (expects ?id=driverId in query)
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }
    await BusDriver.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bus driver' }, { status: 500 });
  }
}