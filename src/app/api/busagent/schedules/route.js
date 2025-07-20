import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BusSchedule from '@/models/BusSchedule';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch schedules from database
    const schedules = await BusSchedule.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const scheduleData = await request.json();
    console.log('Received schedule data:', scheduleData);
    
    // Validate required fields based on BusSchedule model
    const required = ['busNumber', 'route', 'departureTime', 'arrivalTime', 'date', 'price', 'agency', 'totalSeats', 'seatsAvailable'];
    const missing = [];
    
    for (const field of required) {
      if (scheduleData[field] === undefined || scheduleData[field] === null || scheduleData[field] === '') {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      console.error('Missing required fields:', missing);
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate route object specifically
    if (!scheduleData.route || typeof scheduleData.route !== 'object') {
      return NextResponse.json(
        { error: 'Route must be an object with from and to properties' },
        { status: 400 }
      );
    }
    
    if (!scheduleData.route.from || !scheduleData.route.to) {
      console.error('Invalid route:', scheduleData.route);
      return NextResponse.json(
        { error: 'Route from and to are required' },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (isNaN(Number(scheduleData.price))) {
      return NextResponse.json(
        { error: 'Price must be a valid number' },
        { status: 400 }
      );
    }
    
    if (isNaN(Number(scheduleData.totalSeats)) || isNaN(Number(scheduleData.seatsAvailable))) {
      return NextResponse.json(
        { error: 'Total seats and available seats must be valid numbers' },
        { status: 400 }
      );
    }
    
    // Prepare the data exactly matching BusSchedule schema
    const scheduleForDB = {
      busNumber: String(scheduleData.busNumber),
      route: {
        from: String(scheduleData.route.from),
        to: String(scheduleData.route.to)
      },
      departureTime: String(scheduleData.departureTime),
      arrivalTime: String(scheduleData.arrivalTime),
      date: String(scheduleData.date),
      price: Number(scheduleData.price),
      agency: String(scheduleData.agency),
      totalSeats: Number(scheduleData.totalSeats),
      seatsAvailable: Number(scheduleData.seatsAvailable),
      bookedSeats: [],
      status: scheduleData.status || 'active'
    };
    
    // Only add ObjectId references if they are valid ObjectIds
    if (scheduleData.bus && mongoose.Types.ObjectId.isValid(scheduleData.bus)) {
      scheduleForDB.bus = scheduleData.bus;
    }
    if (scheduleData.agent && mongoose.Types.ObjectId.isValid(scheduleData.agent)) {
      scheduleForDB.agent = scheduleData.agent;
    }
    
    console.log('Prepared schedule data for DB:', scheduleForDB);
    
    // Create new schedule in database
    const newSchedule = await BusSchedule.create(scheduleForDB);
    console.log('Schedule created in database:', newSchedule);
    
    // Create notification for new schedule
    await createScheduleNotification(newSchedule, 'created');
    
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    console.error('Error stack:', error.stack);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => `${err.path}: ${err.message}`);
      console.error('Validation errors:', validationErrors);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create schedule', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Delete the schedule
    const deletedSchedule = await BusSchedule.findByIdAndDelete(id);
    
    if (!deletedSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    console.log('Schedule deleted:', deletedSchedule);
    
    return NextResponse.json({ 
      message: 'Schedule deleted successfully',
      deletedSchedule 
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to create notifications
async function createScheduleNotification(schedule, action) {
  try {
    const notification = {
      id: Date.now(),
      type: 'schedule',
      title: `Schedule ${action}`,
      message: `Bus ${schedule.busNumber} from ${schedule.route.from} to ${schedule.route.to} has been ${action}`,
      scheduleId: schedule.id,
      agentId: schedule.agentId,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    // In production, save notification to database
    console.log('Notification created:', notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
