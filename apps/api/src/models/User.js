const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    openId: {
      type: String,
      unique: true,
      sparse: true,
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
