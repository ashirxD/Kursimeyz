const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes/apis');
const connectDB = require('./config/db');

// Load config
dotenv.config();



const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies for JWT extraction

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
app.use(cors({
    origin: ['http://localhost:1800', 'http://127.0.0.1:1800'],
    credentials: true,
}));

// Routes
app.use('/api', apiRoutes);

const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
let server;

// Connect to DB and start server
if (process.env.MONGO_URI) {
    connectDB().then(() => {
        server = app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    });
} else {
    console.error('CRITICAL: MONGO_URI not found in environment variables. Server cannot start.');
    process.exit(1);
}

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);

    if (server) {
        server.close(async () => {
            console.log('HTTP server closed.');

            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed.');
                process.exit(0);
            } catch (err) {
                console.error('Error during MongoDB connection close:', err);
                process.exit(1);
            }
        });
    } else {
        process.exit(0);
    }

    // Force shutdown after 10 seconds if not closed gracefully
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
