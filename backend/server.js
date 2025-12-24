require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Logging Middleware (Matches PDF req )
app.use((req, res, next) => {
  console.log(`[LOG]: ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/appointment_db")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("DB Error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const User = require("./models/User");
const Appointment = require("./models/Appointment");
const Message = require("./models/Message");

// --- AUTH ROUTES ---

// Register (Student) [cite: 24]
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({
    name,
    email,
    password,
    role: "student",
    isApproved: false,
  });
  await user.save();
  res.json({ message: "Registration successful. Wait for Admin approval." });
});

// Login (All Roles) [cite: 17, 25]
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Check for hardcoded admin first, before checking the database

  const user = await User.findOne({ email, password });
  if (!user) return res.status(400).json({ error: "User not found" });
  if (user.role === "student" && !user.isApproved) {
    return res
      .status(403)
      .json({ error: "Account not approved by Admin yet." });
  }


  res.json(user);
});
app.post("/api/admin/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
      isApproved: true
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- ADMIN ROUTES [cite: 11-15] ---

// Add Teacher
app.post("/api/admin/add-teacher", async (req, res) => {
  const { name, email, password, department, subject } = req.body;
  const teacher = new User({
    name,
    email,
    password,
    department,
    subject,
    role: "teacher",
    isApproved: true,
  });
  await teacher.save();
  res.json({ message: "Teacher added successfully" });
});

// Approve Student
app.put("/api/admin/approve-student/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isApproved: true });
  res.json({ message: "Student approved" });
});

// Get Pending Students
app.get("/api/admin/pending-students", async (req, res) => {
  const students = await User.find({ role: "student", isApproved: false });
  res.json(students);
});

// Temporary route to debug - remove this later
app.get("/api/debug/user/:email", async (req, res) => {
  const u = await User.findOne({ email: req.params.email });
  res.json(u || { error: "not found" });
});

// --- TEACHER ROUTES [cite: 16-22] ---

// View Appointments [cite: 21]
app.get("/api/teacher/appointments/:teacherId", async (req, res) => {
  const apps = await Appointment.find({
    teacherId: req.params.teacherId,
  }).populate("studentId", "name");
  res.json(apps);
});

// Approve/Cancel Appointment
app.put("/api/teacher/appointment/:id", async (req, res) => {
  const { status } = req.body; // 'approved' or 'cancelled'
  await Appointment.findByIdAndUpdate(req.params.id, { status });
  res.json({ message: `Appointment ${status}` });
});

// --- ADMIN APPOINTMENT ROUTES ---
// Get all appointments (Admin view)
app.get("/api/admin/appointments", async (req, res) => {
  const apps = await Appointment.find()
    .populate("studentId", "name email")
    .populate("teacherId", "name department subject");
  res.json(apps);
});

// Delete an appointment (Admin)
app.delete("/api/admin/appointment/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting appointment" });
  }
});
// --- STUDENT ROUTES [cite: 23-28] ---

// Search Teachers [cite: 26]
app.get("/api/teachers", async (req, res) => {
  const teachers = await User.find({ role: "teacher" });
  res.json(teachers);
});

// Get student appointments (all statuses)
app.get("/api/student/appointments/:studentId", async (req, res) => {
  const apps = await Appointment.find({
    studentId: req.params.studentId,
  }).populate("teacherId", "name department subject");
  res.json(apps);
});

// Book Appointment
app.post("/api/book", async (req, res) => {
  const { studentId, teacherId, date, time, purpose, message } = req.body;
  const appt = new Appointment({
    studentId,
    teacherId,
    date,
    time,
    purpose,
    message,
  });
  await appt.save();
  res.json({ message: "Appointment requested" });
});

// Messages - send and retrieve
app.post("/api/messages", async (req, res) => {
  const { senderId, receiverId, content, appointmentId } = req.body;
  const msg = new Message({ senderId, receiverId, content, appointmentId });
  await msg.save();
  res.json({ message: "Message sent" });
});

app.get("/api/messages/:userId", async (req, res) => {
  const uid = req.params.userId;
  const msgs = await Message.find({
    $or: [{ senderId: uid }, { receiverId: uid }],
  })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .sort({ createdAt: -1 });
  res.json(msgs);
});

app.get("/api/messages/thread/:appointmentId", async (req, res) => {
  const msgs = await Message.find({ appointmentId: req.params.appointmentId })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .sort({ createdAt: 1 });
  res.json(msgs);
});

// Thread between two users (no appointment)
app.get("/api/messages/thread/users/:u1/:u2", async (req, res) => {
  const { u1, u2 } = req.params;
  const msgs = await Message.find({
    $or: [
      { senderId: u1, receiverId: u2 },
      { senderId: u2, receiverId: u1 },
    ],
  })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .sort({ createdAt: 1 });
  res.json(msgs);
});

// DELETE Teacher
app.delete("/api/admin/teacher/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting teacher" });
  }
});

// UPDATE Teacher (e.g., change department or subject)
app.put("/api/admin/teacher/:id", async (req, res) => {
  const { name, department, subject } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.id, { name, department, subject });
    res.json({ message: "Teacher updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating teacher" });
  }
});
