const mongoose = require('mongoose');

const menuInteractionSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['like', 'report'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only like/report once per menu item
menuInteractionSchema.index({ menuItemId: 1, userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('MenuInteraction', menuInteractionSchema);
