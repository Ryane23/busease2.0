import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  route: {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  schedule: {
    departure: { type: Date, required: true },
    arrival: { type: Date, required: true }
  },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.models.Bus || mongoose.model('Bus', busSchema, 'Buses');
