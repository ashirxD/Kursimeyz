const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config({ path: './.env' }); // Load env vars

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@admin.com';
        const user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log('Admin user already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const password = '1234';
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username: 'admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            phone: '1234567890' // Dummy phone
        });

        console.log('Admin user created successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
