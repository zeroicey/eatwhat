const mongoose = require('mongoose');

const momentLikeSchema = new mongoose.Schema(
  {
    momentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Moment',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only like once per moment
momentLikeSchema.index({ momentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('MomentLike', momentLikeSchema);
