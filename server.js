
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully');
    })
    .catch((err) => {
        console.log('MongoDB Connection Error:', err);
    });

// Home Route
app.get('/', (req, res) => {
    res.send('Authentication Server is Running');
});

// SIGN UP API
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check all fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: 'Registration successful!'
        });

    } catch (error) {
        console.log('Signup Error:', error);

        res.status(500).json({
            message: 'Server error during registration'
        });
    }
});

// LOGIN API
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Successful login
        res.status(200).json({
            message: 'Login successful!',
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log('Login Error:', error);

        res.status(500).json({
            message: 'Server error during login'
        });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
