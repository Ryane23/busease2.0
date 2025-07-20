import mongoose from 'mongoose';

const BusDriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  company: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Company',   // or 'BusAgency' if that's your model name
      required: true 
  },
    password: { type: String, required: true },
  status: { type: String, enum: ['available', 'on_trip', 'off_duty'], default: 'available' },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }
}, { timestamps: true });

export default mongoose.models.BusDriver || mongoose.model('BusDriver', BusDriverSchema, 'BusDrivers');

