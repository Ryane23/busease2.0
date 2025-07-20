import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Company from '@/models/company';

export async function GET() {
  try {
    await dbConnect();
    const companies = await Company.find({}).sort({ createdAt: -1 });
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const { name, email, address } = await request.json();

    // Validate required fields
    if (!name || !email || !address) {
      return NextResponse.json(
        { error: 'Name, email, and address are required' },
        { status: 400 }
      );
    }

    // Check if company with email already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this email already exists' },
        { status: 400 }
      );
    }

    // Create new company
    const company = new Company({
      name,
      email,
      address,
      createdAt: new Date().toISOString().slice(0, 10)
    });

    await company.save();

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Company with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}