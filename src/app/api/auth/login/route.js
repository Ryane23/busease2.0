import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Admin from '@/models/Admin';
import BusDriver from '@/models/BusDriver';
import BusAgent from '@/models/BusAgent';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    let user = null;
    let userRole = role;

    console.log('Login attempt for:', email, 'with role:', role);

    // UNIFIED APPROACH: Always check User collection first for ALL roles
    user = await User.findOne({ email });
    
    if (user) {
      // User found in main User collection
      const storedRole = user.role || 'passenger';
      console.log('User found in User collection with stored role:', storedRole);
      
      // Validate role match - be flexible for passengers
      if (role === 'passenger') {
        // For passenger login, accept if stored as passenger or no role set
        if (storedRole === 'passenger' || !user.role) {
          userRole = 'passenger';
        } else {
          console.log('User is not a passenger. Stored role:', storedRole);
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }
      } else {
        // For other roles (admin, busdriver, busagent), require exact match
        if (role !== storedRole) {
          console.log('Role mismatch: requested', role, 'but user has', storedRole);
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }
        userRole = storedRole;
      }
    } else {
      // If not found in User collection, check role-specific collections as fallback
      console.log('User not found in User collection, checking role-specific collections...');
      
      switch (role) {
        case 'admin':
          user = await Admin.findOne({ email });
          if (user) {
            userRole = 'admin';
            console.log('Admin found in Admin collection');
          }
          break;
        case 'busdriver':
          user = await BusDriver.findOne({ email });
          if (user) {
            userRole = 'busdriver';
            console.log('Bus driver found in BusDriver collection');
          }
          break;
        case 'busagent':
          user = await BusAgent.findOne({ email }).populate('company', 'name');
          if (user) {
            userRole = 'busagent';
            console.log('Bus agent found in BusAgent collection');
          }
          break;
        case 'passenger':
          // Passengers should only be in User collection
          console.log('Passenger not found in User collection');
          break;
        default:
          console.log('Unknown role:', role);
      }
    }

    if (!user) {
      console.log('No user found with email:', email, 'and role:', role);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: userRole,
        name: user.name
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', email, 'with role:', userRole);

    // Prepare user data response (exclude password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      ...(role === 'busagent' && user.company && {
        company: {
          id: user.company._id,
          name: user.company.name
        }
      })
    };

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}, '-password');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}