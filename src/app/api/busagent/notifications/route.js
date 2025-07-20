import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

// Mock notifications store (in production, this would be database operations)
let notificationStore = [
  {
    id: 1,
    type: 'schedule',
    title: 'Welcome',
    message: 'Welcome to the Bus Agent portal! You can now create and manage bus schedules.',
    agentId: 'agent-1',
    createdAt: new Date().toISOString(),
    read: false
  }
];

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId') || 'agent-1';
    
    // In production, fetch from database
    // const notifications = await Notification.find({ agentId }).sort({ createdAt: -1 });
    
    const notifications = notificationStore
      .filter(n => n.agentId === agentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const notificationData = await request.json();
    
    // Validate required fields
    if (!notificationData.title || !notificationData.message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }
    
    // Create new notification
    const newNotification = {
      id: Date.now(),
      type: notificationData.type || 'general',
      title: notificationData.title,
      message: notificationData.message,
      agentId: notificationData.agentId || 'agent-1',
      scheduleId: notificationData.scheduleId,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    // In production, save to database
    // const savedNotification = await Notification.create(newNotification);
    
    notificationStore.push(newNotification);
    
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    
    const { id, read } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    // Find and update notification
    const notificationIndex = notificationStore.findIndex(n => n.id === parseInt(id));
    
    if (notificationIndex === -1) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    notificationStore[notificationIndex].read = read !== undefined ? read : true;
    
    // In production, update in database
    // await Notification.findByIdAndUpdate(id, { read });
    
    return NextResponse.json(notificationStore[notificationIndex]);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
