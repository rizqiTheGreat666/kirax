const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Mengekspor fungsi konfigurasi
module.exports = function (passport) {
    
    // --- 1. Strategi Lokal (Logika Login) ---
    passport.use(new LocalStrategy({ 
        usernameField: 'username' // Field yang digunakan di formulir login
    },
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username });

            // Cek pengguna ada atau tidak
            if (!user) {
                return done(null, false, { message: 'Username not found.' });
            }

            // Bandingkan password
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                return done(null, user); // Berhasil
            } else {
                return done(null, false, { message: 'Password incorrect.' });
            }
        } catch (err) {
            console.error('Passport Strategy Error:', err);
            return done(err);
        }
    }));

    // --- 2. Serialisasi: Menyimpan ID pengguna ke dalam sesi ---
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // --- 3. Deserialisasi: Mengambil objek pengguna dari ID yang ada di sesi ---
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            console.error('Deserialize Error:', err);
            done(err, null);
        }
    });
};