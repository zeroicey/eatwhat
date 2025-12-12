const mongoose = require('mongoose');

const momentCommentSchema = new mongoose.Schema(
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
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

momentCommentSchema.index({ momentId: 1, createdAt: -1 });

module.exports = mongoose.model('MomentComment', momentCommentSchema);
