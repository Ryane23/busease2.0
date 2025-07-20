import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BusDriver from '@/models/BusDriver';

export async function GET() {
  try {
    await dbConnect();
    const busDrivers = await BusDriver.find({}).populate('company').sort({ createdAt: -1 });
    return NextResponse.json(busDrivers);
  } catch (error) {
    console.error('Error fetching bus drivers:', error);
    return NextResponse.json({ error: 'Failed to fetch bus drivers' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const busDriver = await BusDriver.create(body);
    return NextResponse.json(busDriver, { status: 201 });
  } catch (error) {
    console.error('Error creating bus driver:', error);
    return NextResponse.json({ error: 'Failed to create bus driver' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 });
    }
    
    const busDriver = await BusDriver.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!busDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }
    
    return NextResponse.json(busDriver);
  } catch (error) {
    console.error('Error updating bus driver:', error);
    return NextResponse.json({ error: 'Failed to update bus driver' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 });
    }
    
    const busDriver = await BusDriver.findByIdAndDelete(id);
    
    if (!busDriver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus driver:', error);
    return NextResponse.json({ error: 'Failed to delete bus driver' }, { status: 500 });
  }
}
