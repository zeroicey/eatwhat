const mongoose = require('mongoose');

const momentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    images: {
      type: [String],
      default: [],
      validate: [arrayLimit, 'Exceeds the limit of 9 images'],
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length <= 9;
}

momentSchema.index({ createdAt: -1 });
momentSchema.index({ storeId: 1, createdAt: -1 });

module.exports = mongoose.model('Moment', momentSchema);
