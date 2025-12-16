const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  // Teacher specific fields [cite: 13]
  department: String,
  subject: String,
  // Student specific: Approval status 
  isApproved: { type: Boolean, default: false } 
});

module.exports = mongoose.model('User', UserSchema);