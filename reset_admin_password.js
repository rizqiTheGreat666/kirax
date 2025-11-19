const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/userModel');

async function resetAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // New admin password
        const newPassword = 'admin123'; // Change this if you want

        // Hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update or create admin user
        const admin = await User.findOneAndUpdate(
            { username: 'roro_admin' },
            { 
                username: 'roro_admin',
                email: 'admin@kirakira.com',
                password: hashedPassword,
                role: 'admin',
                saldo_waktu: 0
            },
            { upsert: true, new: true }
        );

        console.log('✅ Admin password reset successfully!');
        console.log(`   Username: ${admin.username}`);
        console.log(`   Password: ${newPassword}`);
        console.log(`   Role: ${admin.role}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetAdminPassword();
