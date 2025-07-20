import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

// Mock data store for agent buses (in production, this would be database operations)
let agentBusStore = [
  {
    _id: '1',
    busNumber: 'BUS-001',
    capacity: 40,
    route: { from: 'Douala', to: 'Yaounde' },
    schedule: {
      departure: new Date('2024-01-01T08:00'),
      arrival: new Date('2024-01-01T13:00')
    },
    price: 5000,
    status: 'active',
    agentId: 'agent-1',
    company: 'Default Company'
  },
  {
    _id: '2',
    busNumber: 'BUS-002',
    capacity: 35,
    route: { from: 'Yaounde', to: 'Bamenda' },
    schedule: {
      departure: new Date('2024-01-01T14:00'),
      arrival: new Date('2024-01-01T18:00')
    },
    price: 7500,
    status: 'active',
    agentId: 'agent-1',
    company: 'Default Company'
  }
];

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId') || 'agent-1';
    const company = searchParams.get('company') || 'Default Company';
    
    console.log('Fetching buses for agentId:', agentId, 'company:', company);
    console.log('Total buses in store:', agentBusStore.length);
    
    // Filter buses by agent/company
    const agentBuses = agentBusStore.filter(bus => 
      bus.agentId === agentId || bus.company === company
    );
    
    console.log('Filtered buses:', agentBuses.length, agentBuses);
    
    return NextResponse.json(agentBuses);
  } catch (error) {
    console.error('Error fetching agent buses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const busData = await request.json();
    console.log('Received bus data:', busData);
    
    // Validate required fields
    const required = ['busNumber', 'capacity', 'route', 'schedule', 'price'];
    for (const field of required) {
      if (!busData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Check if bus number already exists
    const existingBus = agentBusStore.find(bus => bus.busNumber === busData.busNumber);
    if (existingBus) {
      return NextResponse.json(
        { error: 'Bus number already exists' },
        { status: 400 }
      );
    }
    
    // Create new bus with company association
    const newBus = {
      _id: Date.now().toString(),
      busNumber: busData.busNumber,
      capacity: parseInt(busData.capacity),
      route: busData.route,
      schedule: busData.schedule,
      price: parseFloat(busData.price),
      status: busData.status || 'active',
      agentId: busData.agentId || 'agent-1',
      company: busData.company || 'Default Company',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to store
    agentBusStore.push(newBus);
    
    console.log(`Bus ${newBus.busNumber} created and added to store`);
    console.log('Updated store length:', agentBusStore.length);
    console.log('New bus details:', newBus);
    
    return NextResponse.json(newBus, { status: 201 });
  } catch (error) {
    console.error('Error creating bus:', error);
    return NextResponse.json(
      { error: 'Failed to create bus' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    
    const updateData = await request.json();
    const { id, ...busData } = updateData;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Bus ID is required' },
        { status: 400 }
      );
    }
    
    // Find and update bus
    const busIndex = agentBusStore.findIndex(bus => bus._id === id);
    
    if (busIndex === -1) {
      return NextResponse.json(
        { error: 'Bus not found' },
        { status: 404 }
      );
    }
    
    // Preserve company association during update
    agentBusStore[busIndex] = {
      ...agentBusStore[busIndex],
      ...busData,
      company: busData.company || agentBusStore[busIndex].company, // Keep existing company if not provided
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Bus ${agentBusStore[busIndex].busNumber} updated for company: ${agentBusStore[busIndex].company}`);
    
    return NextResponse.json(agentBusStore[busIndex]);
  } catch (error) {
    console.error('Error updating bus:', error);
    return NextResponse.json(
      { error: 'Failed to update bus' },
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
        { error: 'Bus ID is required' },
        { status: 400 }
      );
    }
    
    // Find and delete bus
    const busIndex = agentBusStore.findIndex(bus => bus._id === id);
    
    if (busIndex === -1) {
      return NextResponse.json(
        { error: 'Bus not found' },
        { status: 404 }
      );
    }
    
    agentBusStore.splice(busIndex, 1);
    
    return NextResponse.json(
      { message: 'Bus deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting bus:', error);
    return NextResponse.json(
      { error: 'Failed to delete bus' },
      { status: 500 }
    );
  }
}
