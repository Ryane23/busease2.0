import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

// Mock data store (in production, this would be database operations)
let scheduleStore = [];

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // In production, fetch from database
    // const schedule = await Schedule.findById(id);
    
    const schedule = scheduleStore.find(s => s.id === parseInt(id));
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const updateData = await request.json();
    
    // Validate required fields
    const required = ['busNumber', 'route', 'departure', 'arrival', 'date', 'price', 'agency', 'totalSeats', 'availableSeats'];
    for (const field of required) {
      if (!updateData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate route object
    if (!updateData.route.from || !updateData.route.to) {
      return NextResponse.json(
        { error: 'Route from and to are required' },
        { status: 400 }
      );
    }
    
    // Find and update schedule
    const scheduleIndex = scheduleStore.findIndex(s => s.id === parseInt(id));
    
    if (scheduleIndex === -1) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    // Update schedule
    const updatedSchedule = {
      ...scheduleStore[scheduleIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    scheduleStore[scheduleIndex] = updatedSchedule;
    
    // In production, update in database
    // const updatedSchedule = await Schedule.findByIdAndUpdate(id, updateData, { new: true });
    
    // Create notification for updated schedule
    await createScheduleNotification(updatedSchedule, 'updated');
    
    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Find schedule
    const scheduleIndex = scheduleStore.findIndex(s => s.id === parseInt(id));
    
    if (scheduleIndex === -1) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    // Get schedule data before deletion for notification
    const scheduleToDelete = scheduleStore[scheduleIndex];
    
    // Delete schedule
    scheduleStore.splice(scheduleIndex, 1);
    
    // In production, delete from database
    // await Schedule.findByIdAndDelete(id);
    
    // Create notification for deleted schedule
    await createScheduleNotification(scheduleToDelete, 'deleted');
    
    return NextResponse.json(
      { message: 'Schedule deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
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
    
    // You could also send real-time notifications here using WebSockets or Server-Sent Events
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
