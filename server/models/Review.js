const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },
    serviceCategory: {
      type: String,
      enum: ['electrician', 'plumber', 'carpenter', 'tailor', 'maintenance'],
    },
  },
  { timestamps: true }
);

// Update provider rating after save
reviewSchema.post('save', async function () {
  const ServiceProvider = require('./ServiceProvider');
  const reviews = await this.constructor.find({ providerId: this.providerId });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await ServiceProvider.findByIdAndUpdate(this.providerId, {
    rating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length,
  });
});

module.exports = mongoose.model('Review', reviewSchema);
