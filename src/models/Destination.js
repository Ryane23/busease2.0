// models/Destination.js
import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  from: String,
  to: String,
  distance: Number,
  price: Number
}, { timestamps: true });

export default mongoose.models.Destination || mongoose.model('Destination', destinationSchema);
