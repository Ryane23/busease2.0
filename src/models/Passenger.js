import mongoose from 'mongoose';

const PassengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  secretText: { type: String },
  phoneNumber: String,
  address: String,
  travelHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
}, { timestamps: true });

export default mongoose.models.Passenger || mongoose.model('Passenger', PassengerSchema, 'Users');
