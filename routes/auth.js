const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');


// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'deepakrawatdev63@gmail.com', // Replace with your email
    pass: 'kyva mxvv ninw hfgk' // Use an App Password (Google security settings)
  }
});

// Forgot Password API - Send OTP
// ✅ Route to send OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // ✅ OTP valid for 5 minutes

  // Save OTP & Expiry in DB
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  // Send OTP via Email
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP is: ${otp}. It expires in 5 minutes.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).json({ message: 'Error sending OTP' });

    res.status(200).json({ message: 'OTP sent to email' });
  });
});
//verify otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  // ✅ Check if OTP matches and not expired
  if (user.otp !== parseInt(otp)) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (new Date() > user.otpExpires) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  res.status(200).json({ message: 'OTP verified successfully' });
});
//reset
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.otp !== parseInt(otp)) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  // ✅ Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // ✅ Clear OTP fields after reset
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
});
//signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, age, name, sex, dob, country, address, phone, username2, profileImageUrl } = req.body;

    // Check if the email is already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ username, email, password, age, name, sex, dob, country, address, phone, username2, profileImageUrl });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        age: user.age,
        name: user.name,
        sex: user.sex,
        dob: user.dob,
        country: user.country,
        address: user.address,
        phone: user.phone,
        username2: user.username2,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });
  
      res.status(200).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.put('/update-profile', async (req, res) => {
    try {
      const { userId, age, name, sex, dob, country, address, phone, username2 } = req.body;
  
      // Find user and update
      const user = await User.findByIdAndUpdate(
        userId,
        { age, name, sex, dob, country, address, phone, username2 },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get('/user/:email', async (req, res) => {
    try {
      const { email } = req.params;
  
      // Find user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          age: user.age,
          name: user.name,
          sex: user.sex,
          dob: user.dob,
          country: user.country,
          address: user.address,
          phone: user.phone,
          username2: user.username2,
          profileImageUrl: user.profileImageUrl
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = router;