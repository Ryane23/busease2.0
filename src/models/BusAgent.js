import mongoose from 'mongoose';

const BusAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company',   // or 'BusAgency' if that's your model name
    required: true 
  },
  password: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.BusAgent || mongoose.model('BusAgent', BusAgentSchema, 'BusAgents');
