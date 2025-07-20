import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BusAgent from '@/models/BusAgent';
import bcrypt from 'bcryptjs';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const { name, email, phone, company, password } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !company) {
      return NextResponse.json(
        { error: 'Name, email, phone, and company are required' },
        { status: 400 }
      );
    }

    // Check if bus agent exists
    const existingAgent = await BusAgent.findById(id);
    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Bus agent not found' },
        { status: 404 }
      );
    }

    // Check if email is already taken by another agent
    const emailExists = await BusAgent.findOne({ email, _id: { $ne: id } });
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = { name, email, phone, company };

    // Only update password if provided
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update bus agent
    const updatedAgent = await BusAgent.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    ).populate('company', 'name');

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error('Error updating bus agent:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update bus agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;

    // Check if bus agent exists
    const agent = await BusAgent.findById(id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Bus agent not found' },
        { status: 404 }
      );
    }

    // Delete bus agent
    await BusAgent.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Bus agent deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting bus agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete bus agent' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;

    const agent = await BusAgent.findById(id, '-password').populate('company', 'name');
    
    if (!agent) {
      return NextResponse.json(
        { error: 'Bus agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error fetching bus agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus agent' },
      { status: 500 }
    );
  }
}
