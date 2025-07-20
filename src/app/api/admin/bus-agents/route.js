import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import BusAgent from '@/models/BusAgent';

export async function GET() {
  try {
    await dbConnect();
    const busAgents = await BusAgent.find({}, '-password')
      .populate('company', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json(busAgents);
  } catch (error) {
    console.error('Error fetching bus agents:', error);
    return NextResponse.json({ error: 'Failed to fetch bus agents' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const { name, email, phone, company, password } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !company) {
      return NextResponse.json(
        { error: 'Name, email, phone, and company are required' },
        { status: 400 }
      );
    }

    // Check if bus agent with email already exists
    const existingAgent = await BusAgent.findOne({ email });
    if (existingAgent) {
      return NextResponse.json(
        { error: 'Bus agent with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'defaultPassword123', 12);

    // Create new bus agent
    const busAgent = new BusAgent({
      name,
      email,
      phone,
      company,
      password: hashedPassword
    });

    await busAgent.save();

    // Return agent without password and populate company
    const savedAgent = await BusAgent.findById(busAgent._id, '-password')
      .populate('company', 'name');

    return NextResponse.json(savedAgent, { status: 201 });
  } catch (error) {
    console.error('Error creating bus agent:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Bus agent with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create bus agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }
    await BusAgent.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting bus agent:', error);
    return NextResponse.json({ error: 'Failed to delete bus agent' }, { status: 500 });
  }
}