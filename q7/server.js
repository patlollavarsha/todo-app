const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/fsdlab')
  .then(() => console.log('MongoDB connected'));

const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
}));

const Contact = mongoose.model('Contact', new mongoose.Schema({
  name: String,
  email: String,
  message: String
}));

// Register
app.post('/api/register', async (req, res) => {
  try {
    await User.create(req.body);
    res.json({ message: 'Registered successfully. Please login.' });
  } catch (e) {
    res.status(400).json({ message: 'Registration failed (email may already exist)' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const u = await User.findOne({ email: req.body.email, password: req.body.password });
  if (!u) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ message: 'Welcome ' + u.name });
});

// Contact
app.post('/api/contact', async (req, res) => {
  await Contact.create(req.body);
  res.json({ message: 'Your message has been sent!' });
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));