const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/apis');
const connectDB = require('./config/db');

// Load config
dotenv.config();



const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: 'http://localhost:1800', // Client URL
    credentials: true,
}));

// Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
if (process.env.MONGO_URI) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    });
} else {
    console.log('MONGO_URI not found in environment variables. Server not started.');
}


module.exports = app;
