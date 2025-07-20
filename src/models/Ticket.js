// models/Ticket.js
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // References User model
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'BusSchedule' },
  seatNumber: Number,
  qrCode: String,
  paid: { type: Boolean, default: false },
  passengerName: String, // Store passenger name for convenience
  phone: String,
  specialRequests: String
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
