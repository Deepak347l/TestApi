const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Store OTPs in memory (use a database like Redis for production)
const otpStore = {};

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'deepakrawatdev63@gmail.com', // Replace with your email
    pass: 'kyva mxvv ninw hfgk' // Use an App Password (Google security settings)
  }
});

// Forgot Password API - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store OTP temporarily (should use Redis in production)
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 minutes expiry

    // Send OTP via email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset Password API - Verify OTP and Change Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Check if OTP is valid
    if (!otpStore[email] || otpStore[email].otp !== parseInt(otp) || otpStore[email].expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Remove OTP from store
    delete otpStore[email];

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


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