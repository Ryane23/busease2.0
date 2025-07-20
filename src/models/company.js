import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10)
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Company = mongoose.models.Company || mongoose.model('Company', companySchema, 'Companies');

export async function GET() {
  try {
    await dbConnect();
    const companies = await Company.find({});
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error in GET /api/admin/companies:', error.message, error.stack);
    return NextResponse.json({ error: 'Failed to fetch companies', details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const company = await Company.create(body);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/companies:', error.message, error.stack);
    return NextResponse.json({ error: 'Failed to create company', details: error.message }, { status: 500 });
  }
}

export default Company;