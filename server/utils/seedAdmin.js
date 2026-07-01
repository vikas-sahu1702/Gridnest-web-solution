const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');
    const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      console.log('Admin account already exists. Updating password...');
      existing.password = process.env.ADMIN_PASSWORD;
      await existing.save();
      console.log('Admin password updated.');
    } else {
      await Admin.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'superadmin',
      });
      console.log('Admin account created successfully.');
    }
    console.log('Email: ' + process.env.ADMIN_EMAIL);
    console.log('Password: ' + process.env.ADMIN_PASSWORD);
    console.log('Role: superadmin');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
