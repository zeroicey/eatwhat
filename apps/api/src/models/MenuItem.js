const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'hidden'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({ storeId: 1, createdAt: -1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
