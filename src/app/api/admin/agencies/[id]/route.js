import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Agency from '@/models/agency';
import Company from '@/models/company';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const { name, company, locations } = await request.json();

    console.log('Updating agency:', { id, name, company, locations });

    // Validate required fields
    if (!name || !company || !locations) {
      return NextResponse.json(
        { error: 'Name, company, and locations are required' },
        { status: 400 }
      );
    }

    // Check if agency exists
    const existingAgency = await Agency.findById(id);
    if (!existingAgency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    // Ensure locations is an array and filter out empty strings
    let locationsArray;
    if (Array.isArray(locations)) {
      locationsArray = locations.filter(loc => loc && loc.trim());
    } else if (typeof locations === 'string') {
      locationsArray = locations.split(',').map(loc => loc.trim()).filter(loc => loc);
    } else {
      locationsArray = [];
    }
    
    if (locationsArray.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid location is required' },
        { status: 400 }
      );
    }

    // Find company by name or ID
    let companyDoc;
    if (mongoose.Types.ObjectId.isValid(company)) {
      companyDoc = await Company.findById(company);
    } else {
      companyDoc = await Company.findOne({ name: company });
    }

    if (!companyDoc) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 400 }
      );
    }

    // Check if another agency with same name exists for this company (excluding current agency)
    const duplicateAgency = await Agency.findOne({ 
      name, 
      company: companyDoc._id,
      _id: { $ne: id } 
    });
    
    if (duplicateAgency) {
      return NextResponse.json(
        { error: 'Agency with this name already exists for this company' },
        { status: 400 }
      );
    }

    // Update agency
    const updatedAgency = await Agency.findByIdAndUpdate(
      id,
      { 
        name, 
        company: companyDoc._id, 
        locations: locationsArray,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('company', 'name email');

    console.log('Agency updated successfully:', updatedAgency);

    return NextResponse.json(updatedAgency);
  } catch (error) {
    console.error('Error updating agency:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Agency with this name already exists for this company' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update agency' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;

    // Check if agency exists
    const agency = await Agency.findById(id);
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    // Delete agency
    await Agency.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Agency deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting agency:', error);
    return NextResponse.json(
      { error: 'Failed to delete agency' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;

    const agency = await Agency.findById(id).populate('company', 'name email');
    
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(agency);
  } catch (error) {
    console.error('Error fetching agency:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agency' },
      { status: 500 }
    );
  }
}
