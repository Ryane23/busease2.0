import { NextResponse } from 'next/server';
import { hashPassword, comparePassword, generateToken } from '../utils/authUtils.js';
import User from '../models/User.js';
import BusDriver from '../models/BusDriver.js';
import BusAgent from '../models/BusAgent.js';
import Admin from '../models/Admin.js';

// Auth controller functions
export const registerPassenger = async (data) => {
  try {
    const { name, username, email, password } = data;
    const hashedPassword = await hashPassword(password);
    
    const passenger = await User.create({
      name, 
      email, 
      password: hashedPassword,
      role: 'passenger'
    });

    const token = generateToken(passenger._id, 'passenger');
    return NextResponse.json({ success: true, token }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
};

export const registerBusDriver = async (req, res) => {
  try {
    const { name, username, email, password, experience, licenseNumber } = req.body;
    const hashedPassword = await hashPassword(password);
    
    const driver = await BusDriver.create({
      name,
      username,
      email,
      password: hashedPassword,
      experience,
      licenseNumber
    });

    const token = generateToken(driver._id, 'busdriver');
    res.status(201).json({ success: true, token });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const registerBusAgent = async (req, res) => {
  try {
    const { name, username, email, password, busStation } = req.body;
    const hashedPassword = await hashPassword(password);
    
    const agent = await BusAgent.create({
      name,
      username,
      email,
      password: hashedPassword,
      busStation
    });

    const token = generateToken(agent._id, 'busagent');
    res.status(201).json({ success: true, token });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const registerAdmin = async (data) => {
  try {
    const { name, username, email, password, adminCode } = data;
    const hashedPassword = await hashPassword(password);
    
    const admin = await Admin.create({
      name,
      username,
      email,
      password: hashedPassword,
      adminCode
    });

    const token = generateToken(admin._id, 'admin');
    return NextResponse.json({ success: true, token }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    let Model;
    
    switch(role) {
      case 'passenger': Model = User; break;
      case 'admin': Model = Admin; break;
      default: throw new Error('Invalid role');
    }

    const user = await Model.findOne({ 
      email,
      ...(role === 'passenger' && { role: 'passenger' })
    });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, role);
    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
