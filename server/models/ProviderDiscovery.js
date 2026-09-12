const mongoose = require('mongoose');

const providerDiscoverySchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, trim: true, maxlength: 120 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    category: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

providerDiscoverySchema.index({ createdAt: -1 });
providerDiscoverySchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('ProviderDiscovery', providerDiscoverySchema);
