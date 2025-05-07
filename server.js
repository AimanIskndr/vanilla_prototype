const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

mongoose.connect('mongodb://localhost:27017/lingopair', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  nativeLanguage: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
  const { name, email, password, nativeLanguage, targetLanguage } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      nativeLanguage,
      targetLanguage
    });

    await user.save();
    res.status(201).send('User created');
  } catch (error) {
    console.error('Error creating user:', error);

    if (error.code === 11000) {
      res.status(400).send('Email already exists');
    } else if (error.name === 'ValidationError') {
      res.status(400).send('Missing required fields');
    } else {
      res.status(500).send('Server error');
    }
  }
});

app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { name: identifier }]
    });

    if (!user) {
      console.error('User not found');
      return res.status(400).send('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error('Invalid password');
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id, username: user.name }, // Include username in the token
      'secretkey'
    );
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Server error');
  }
});

app.put('/update-user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, nativeLanguage, targetLanguage } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, nativeLanguage, targetLanguage },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    res.send('User updated successfully');
  } catch (error) {
    console.error(error);
    res.status(400).send('Error updating user');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});