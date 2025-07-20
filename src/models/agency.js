import mongoose from 'mongoose';

const AgencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Agency name is required'],
    trim: true,
    maxlength: [100, 'Agency name cannot exceed 100 characters']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company reference is required']
  },
  locations: {
    type: [String],
    required: [true, 'At least one location is required'],
    validate: {
      validator: function(locations) {
        return locations && locations.length > 0;
      },
      message: 'At least one location is required'
    }
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10)
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
AgencySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create compound index for unique agency name per company
AgencySchema.index({ name: 1, company: 1 }, { unique: true });

export default mongoose.models.Agency || mongoose.model('Agency', AgencySchema);
