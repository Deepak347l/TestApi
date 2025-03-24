const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  age: { type: Number },
  name: { type: String },
  sex: { type: String, enum: ['Male', 'Female', 'Other'] },
  dob: { type: Date },
  country: { type: String },
  address: { type: String },
  phone: { type: String },
  username2: { type: String, unique: true, sparse: true },
  profileImageUrl: { type: String, required: true, default: "https://example.com/default-profile.png"},
  otp: Number,  // ✅ Store OTP
  otpExpires: Date // ✅ Store OTP expiry time
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;