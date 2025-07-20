import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Company from '@/models/company';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const { name, email, address } = await request.json();

    // Validate required fields
    if (!name || !email || !address) {
      return NextResponse.json(
        { error: 'Name, email, and address are required' },
        { status: 400 }
      );
    }

    // Check if company exists
    const existingCompany = await Company.findById(id);
    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if email is already taken by another company
    const emailExists = await Company.findOne({ email, _id: { $ne: id } });
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { name, email, address },
      { new: true }
    );

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;

    // Check if company exists
    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Delete company
    await Company.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Company deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;

    const company = await Company.findById(id);
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}
