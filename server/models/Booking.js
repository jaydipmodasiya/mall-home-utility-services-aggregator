const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      trim: true,
      maxlength: 120,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
      index: true,
    },
    serviceCategory: {
      type: String,
      required: true,
      enum: ['electrician', 'plumber', 'carpenter', 'tailor', 'maintenance'],
      index: true,
    },
    serviceDescription: {
      type: String,
      required: [true, 'Please describe the service needed'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    bookingType: {
      type: String,
      enum: ['instant', 'scheduled'],
      default: 'instant',
    },
    scheduledAt: {
      type: Date,
    },
    serviceLocation: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      area: String,
      pincode: String,
      landmark: String,
      locationType: {
        type: String,
        enum: ['residential', 'apartment', 'commercial', 'mall'],
        default: 'residential',
      },
    },
    // Authoritative status set; provider acceptance = 'assigned'.
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        previousStatus: String,
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    // Server-calculated from provider pricing — never trusted from client
    estimatedAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      default: 0,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'provider', 'admin', null],
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ providerId: 1, status: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
