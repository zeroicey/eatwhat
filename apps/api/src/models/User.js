const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    openId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    nickName: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
