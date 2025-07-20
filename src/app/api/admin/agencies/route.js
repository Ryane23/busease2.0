import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Agency from '@/models/agency';
import Company from '@/models/company';

// GET all agencies
export async function GET() {
  try {
    await dbConnect();
    console.log('Fetching agencies...');
    
    const agencies = await Agency.find({})
      .populate('company', 'name email') // Populate company details
      .sort({ createdAt: -1 });
    
    console.log('Found agencies:', agencies.length);
    console.log('Sample agency:', agencies[0]);
    
    return NextResponse.json(agencies);
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    );
  }
}

// POST create a new agency
export async function POST(request) {
  try {
    await dbConnect();
    
    const { name, company, locations, createdAt } = await request.json();
    console.log('Creating agency with data:', { name, company, locations });

    // Validate required fields
    if (!name || !company || !locations) {
      return NextResponse.json(
        { error: 'Name, company, and locations are required' },
        { status: 400 }
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
    
    console.log('Processed locations:', locationsArray);
    
    if (locationsArray.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid location is required' },
        { status: 400 }
      );
    }

    // Find company by name or ID
    let companyDoc;
    if (mongoose.Types.ObjectId.isValid(company)) {
      // If company is an ObjectId
      companyDoc = await Company.findById(company);
    } else {
      // If company is a name string
      companyDoc = await Company.findOne({ name: company });
    }

    if (!companyDoc) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 400 }
      );
    }

    console.log('Found company:', companyDoc.name);

    // Check if agency with same name already exists for this company
    const existingAgency = await Agency.findOne({ 
      name, 
      company: companyDoc._id 
    });
    
    if (existingAgency) {
      return NextResponse.json(
        { error: 'Agency with this name already exists for this company' },
        { status: 400 }
      );
    }

    // Create new agency
    const agency = new Agency({
      name,
      company: companyDoc._id,
      locations: locationsArray,
      createdAt: createdAt || new Date().toISOString().slice(0, 10)
    });

    console.log('Saving agency:', agency);
    await agency.save();

    // Populate company details before returning
    await agency.populate('company', 'name email');
    
    console.log('Agency created successfully:', agency);

    return NextResponse.json(agency, { status: 201 });
  } catch (error) {
    console.error('Error creating agency:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Agency with this name already exists for this company' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create agency' },
      { status: 500 }
    );
  }
}

// You can add PUT and DELETE handlers similarly if needed.