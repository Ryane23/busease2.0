// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  targetRole: { type: String, enum: ['user', 'agent', 'driver', 'admin', 'all'], default: 'all' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'BusAgent' }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
