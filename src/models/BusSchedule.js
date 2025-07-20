// models/BusSchedule.js
import mongoose from 'mongoose';

const busScheduleSchema = new mongoose.Schema({
  // Optional references
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: false },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'BusDriver', required: false },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'BusAgent', required: false },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: false },
  
  // Required schedule details
  busNumber: { type: String, required: true },
  route: {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  departureTime: { type: String, required: true }, // e.g., "08:00"
  arrivalTime: { type: String, required: true },   // e.g., "13:00"
  date: { type: String, required: true },          // e.g., "2024-06-15"
  price: { type: Number, required: true },
  agency: { type: String, required: true },
  
  // Seat management
  totalSeats: { type: Number, required: true, default: 40 },
  seatsAvailable: { type: Number, required: true },
  bookedSeats: [{ type: String }], // Array of seat numbers - removed default: []
  
  // Status
  status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' }
}, { timestamps: true });

// Add indexes for better query performance
busScheduleSchema.index({ 'route.from': 1, 'route.to': 1, date: 1 });
busScheduleSchema.index({ agent: 1 });
busScheduleSchema.index({ status: 1 });

export default mongoose.models.BusSchedule || mongoose.model('BusSchedule', busScheduleSchema, 'BusSchedule');
