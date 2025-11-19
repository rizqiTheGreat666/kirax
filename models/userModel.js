// models/userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    saldo_waktu: { type: Number, default: 0 }, // Waktu Kredit
    // Kolom tambahan untuk profil (misal: skill, lokasi)
});

// Fungsi untuk membuat akun admin jika belum ada
userSchema.statics.seedAdminUser = async function() {
    const User = this;
    const adminUsername = 'roro_admin';
    const adminPassword = 'adminpassword123'; // GANTI dengan password yang lebih kuat!

    try {
        const existingAdmin = await User.findOne({ username: adminUsername });

        if (!existingAdmin) {
            // Hash password sebelum disimpan
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            await User.create({
                username: adminUsername,
                email: 'roro@pancadaya.com',
                password: hashedPassword,
                role: 'admin',
                saldo_waktu: 0, 
            });
            console.log(`✅ Admin user '${adminUsername}' created successfully.`);
        } else {
            console.log(`ℹ️ Admin user '${adminUsername}' already exists.`);
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

module.exports = mongoose.model('User', userSchema);