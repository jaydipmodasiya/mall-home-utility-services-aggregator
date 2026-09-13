const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    serviceCategories: [
      {
        type: String,
        enum: ['electrician', 'plumber', 'carpenter', 'tailor', 'maintenance'],
      },
    ],
    skills: [String],
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    pricing: {
      hourlyRate: { type: Number, default: 0 },
      visitingCharge: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    location: {
      city: { type: String, default: '' },
      area: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
        validate: {
          validator: (value) => {
            if (value === undefined) return true;
            return value
              && value.type === 'Point'
              && Array.isArray(value.coordinates)
              && value.coordinates.length === 2
              && Number.isFinite(value.coordinates[0])
              && Number.isFinite(value.coordinates[1])
              && value.coordinates[0] >= -180
              && value.coordinates[0] <= 180
              && value.coordinates[1] >= -90
              && value.coordinates[1] <= 90;
          },
          message: 'Location coordinates must be a valid GeoJSON Point [longitude, latitude]',
        },
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationNote: {
      type: String,
      default: '',
    },
    documents: [
      {
        type: { type: String }, // 'identity', 'skill_certificate', etc.
        filename: String,
        originalName: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availabilitySlots: [
      {
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        startTime: String,
        endTime: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

serviceProviderSchema.index({ 'location.coordinates': '2dsphere' });
serviceProviderSchema.index({ verificationStatus: 1, 'location.city': 1 });
serviceProviderSchema.index({ serviceCategories: 1, verificationStatus: 1 });
serviceProviderSchema.index({ rating: -1, completedJobs: -1 });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
