import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BusSchedule from '@/models/BusSchedule';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { scheduleId, seatNumber, passengerInfo } = await request.json();
    
    if (!scheduleId || !seatNumber || !passengerInfo) {
      return NextResponse.json(
        { error: 'Schedule ID, seat number, and passenger info are required' },
        { status: 400 }
      );
    }

    // Find the schedule
    const schedule = await BusSchedule.findById(scheduleId);
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Check if seat is already booked
    if (schedule.bookedSeats.includes(seatNumber)) {
      return NextResponse.json(
        { error: 'Seat is already booked' },
        { status: 400 }
      );
    }

    // Check if there are available seats
    if (schedule.seatsAvailable <= 0) {
      return NextResponse.json(
        { error: 'No seats available' },
        { status: 400 }
      );
    }

    // Update the schedule
    const updatedSchedule = await BusSchedule.findByIdAndUpdate(
      scheduleId,
      {
        $push: { bookedSeats: seatNumber },
        $inc: { seatsAvailable: -1 }
      },
      { new: true }
    );

    console.log('Seat booked successfully:', {
      scheduleId,
      seatNumber,
      remainingSeats: updatedSchedule.seatsAvailable
    });

    return NextResponse.json({
      message: 'Seat booked successfully',
      schedule: updatedSchedule,
      bookedSeat: seatNumber
    });

  } catch (error) {
    console.error('Error booking seat:', error);
    return NextResponse.json(
      { error: 'Failed to book seat', details: error.message },
      { status: 500 }
    );
  }
}
