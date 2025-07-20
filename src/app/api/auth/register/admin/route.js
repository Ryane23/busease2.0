import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();

    // Validate required fields
    if (!data.email || !data.password || !data.name || !data.adminCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate admin code
    if (data.adminCode !== process.env.ADMIN_SECRET_CODE) {
      return NextResponse.json(
        { error: 'Invalid admin code' },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Create new admin
    const admin = await Admin.create({
      ...data,
      password: hashedPassword,
      role: 'admin'
    });

    // Generate JWT token for automatic login
    const token = jwt.sign(
      { 
        userId: admin._id,
        email: admin.email,
        role: 'admin',
        name: admin.name
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const adminResponse = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    return NextResponse.json({
      message: 'Admin registration successful',
      token,
      user: adminResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Admin registration error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'This email or username is already registered' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
