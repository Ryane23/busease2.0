import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  adminCode: { type: String, required: true },
  role: { type: String, default: 'admin' },
  permissions: [{ type: String }],
  lastLogin: { type: Date },
  status: { type: String, default: 'active' }
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema, 'Admins');
