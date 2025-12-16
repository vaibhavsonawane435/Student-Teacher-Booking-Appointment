const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: String, // format: YYYY-MM-DD
  time: String, // format: HH:mm
  purpose: String, // Message/Purpose [cite: 9]
  status: { type: String, enum: ['pending', 'approved', 'cancelled'], default: 'pending' },
  message: String // Optional message from student [cite: 28]
});

module.exports = mongoose.model('Appointment', AppointmentSchema);