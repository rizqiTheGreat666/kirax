// routes/mainRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Listing = require('../models/listingModel');
const Message = require('../models/messageModel');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const passport = require('passport');

// Helper function untuk mendapatkan data halaman berdasarkan bahasa
const getPageData = (lang, page) => {
    const titles = {
        'home': { id: 'Beranda', en: 'Home' },
        'tutorial': { id: 'Tutorial', en: 'Tutorial' },
        'skill-exchange': { id: 'Tukar Keahlian & Bank Waktu', en: 'Skill Exchange & Time Banking' },
        'about': { id: 'Tentang Kami', en: 'About Us' },
        'join': { id: 'Gabung', en: 'Join/Register' },
        'dashboard': { id: 'Dashboard', en: 'Dashboard' }
    };
    return { title: titles[page] ? titles[page][lang] || titles[page]['id'] : 'KiraX' };
};

// Middleware untuk memastikan user sudah login
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    const lang = req.path.includes('/id/') ? 'id' : 'en';
    const msg = lang === 'id' ? 'Anda harus login terlebih dahulu.' : 'You must login first.';
    res.redirect(`/${lang}/gabung?message=${encodeURIComponent(msg)}&error=true`);
}

// ============ ROUTES ============

// Home Page
router.get(['/id/beranda', '/en/home', '/'], (req, res) => {
    const lang = res.locals.lang;
    const data = getPageData(lang, 'home');
    data.message = req.query.message || null;
    data.isError = req.query.error === 'true';
    res.render('home', data);
});

// Tutorial Page
router.get(['/id/tutorial', '/en/tutorial'], (req, res) => {
    const lang = res.locals.lang;
    const data = getPageData(lang, 'tutorial');
    data.message = req.query.message || null;
    data.isError = req.query.error === 'true';
    res.render('tutorial', data);
});

// About Page
router.get(['/id/tentangkami', '/en/about'], (req, res) => {
    const lang = res.locals.lang;
    const data = getPageData(lang, 'about');
    data.message = req.query.message || null;
    data.isError = req.query.error === 'true';
    res.render('about', data);
});

// Join/Register Page
router.get(['/id/gabung', '/en/join'], (req, res) => {
    const lang = res.locals.lang;
    const data = getPageData(lang, 'join');
    data.message = req.query.message || null;
    data.isError = req.query.error === 'true';
    res.render('join', data);
});

// Register POST
router.post('/register', async (req, res) => {
    const lang = req.body.lang || res.locals.lang || 'id';
    const { username, email, password } = req.body;

    try {
        // Validasi input dasar
        if (!username || !email || !password) {
            const msg = lang === 'id' ? 'Semua field harus diisi.' : 'All fields are required.';
            return res.redirect(`/${lang === 'id' ? 'id/gabung' : 'en/join'}?message=${encodeURIComponent(msg)}&error=true`);
        }

        if (password.length < 6) {
            const msg = lang === 'id' ? 'Password minimal 6 karakter.' : 'Password must be at least 6 characters.';
            return res.redirect(`/${lang === 'id' ? 'id/gabung' : 'en/join'}?message=${encodeURIComponent(msg)}&error=true`);
        }

        // Cek user sudah ada
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            const msg = lang === 'id' ? 'Username atau Email sudah terdaftar.' : 'Username or Email already registered.';
            return res.redirect(`/${lang === 'id' ? 'id/gabung' : 'en/join'}?message=${encodeURIComponent(msg)}&error=true`);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);

        // Buat user baru
        await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            saldo_waktu: 0
        });

        const successMsg = lang === 'id' ? 'Pendaftaran berhasil! Silakan masuk.' : 'Registration successful! Please log in.';
        res.redirect(`/${lang === 'id' ? 'id/gabung' : 'en/join'}?message=${encodeURIComponent(successMsg)}`);

    } catch (error) {
        console.error('Registration Error:', error);
        const lang = req.body.lang || 'id';
        const errMsg = lang === 'id' ? 'Terjadi kesalahan pada pendaftaran.' : 'An error occurred during registration.';
        res.redirect(`/${lang === 'id' ? 'id/gabung' : 'en/join'}?message=${encodeURIComponent(errMsg)}&error=true`);
    }
});

// Login POST - Menggunakan Passport
router.post('/login', (req, res, next) => {
    const lang = req.body.lang || res.locals.lang || 'id';
    
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Auth Error:', err);
            const errMsg = lang === 'id' ? 'Terjadi kesalahan saat login.' : 'An error occurred during login.';
            return res.redirect(`/${lang === 'id' ? 'id/gabung' : 'en/join'}?message=${encodeURIComponent(errMsg)}&error=true`);
        }
        
        if (!user) {
            const msg = info && info.message ? info.message : (lang === 'id' ? 'Username atau password salah.' : 'Invalid username or password.');
            return res.redirect(`/${lang === 'id' ? 'id/gabung' : 'en/join'}?message=${encodeURIComponent(msg)}&error=true`);
        }
        
        // Login berhasil
        req.logIn(user, (err) => {
            if (err) {
                console.error('LogIn Error:', err);
                const errMsg = lang === 'id' ? 'Terjadi kesalahan saat membuat sesi.' : 'An error occurred while creating session.';
                return res.redirect(`/${lang === 'id' ? 'id/gabung' : 'en/join'}?message=${encodeURIComponent(errMsg)}&error=true`);
            }
            
            // Store language preference in session
            req.session.lang = lang;
            const successMsg = lang === 'id' ? 'Login berhasil! Selamat datang.' : 'Login successful! Welcome.';
            res.redirect(`/${lang === 'id' ? 'id/dashboard' : 'en/dashboard'}?message=${encodeURIComponent(successMsg)}`);
        });
    })(req, res, next);
});

// Dashboard
router.get(['/id/dashboard', '/en/dashboard'], ensureAuthenticated, (req, res) => {
    const lang = res.locals.lang;
    const data = getPageData(lang, 'dashboard');
    data.message = req.query.message || null;
    data.isError = req.query.error === 'true';
    res.render('dashboard', data);
});

// Logout
router.get(['/id/keluar', '/en/logout'], (req, res) => {
    const lang = req.path.includes('id') ? 'id' : 'en';
    req.logout((err) => {
        if (err) {
            console.error('Logout Error:', err);
        }
        const msg = lang === 'id' ? 'Anda telah logout.' : 'You have been logged out.';
        res.redirect(`/${lang}/${lang === 'id' ? 'beranda' : 'home'}?message=${encodeURIComponent(msg)}`);
    });
});

// Skill Exchange Page
router.get(['/id/tukarkeahlian', '/en/skill-exchange'], async (req, res) => {
    const lang = res.locals.lang;
    const data = getPageData(lang, 'skill-exchange');
    data.message = req.query.message || null;
    data.isError = req.query.error === 'true';
    data.isAuthenticated = req.isAuthenticated();
    if (req.isAuthenticated()) {
        data.currentUser = req.user;
    }
    
    try {
        // Load listings dari database dengan populate user info
        data.listings = await Listing.find({ status: 'active' })
            .populate('user_id', 'username email')
            .sort({ created_at: -1 });
    } catch (error) {
        console.error('Error loading listings:', error);
        data.listings = [];
    }
    
    res.render('skill_exchange', data);
});

// Create Listing POST
router.post('/create-listing', ensureAuthenticated, async (req, res) => {
    const lang = req.body.lang || res.locals.lang || 'id';
    const { title, description, category, type, time_credit_cost } = req.body;

    try {
        if (!title || !description) {
            const msg = lang === 'id' ? 'Judul dan deskripsi harus diisi.' : 'Title and description are required.';
            return res.redirect(`/${lang === 'id' ? 'id/tukarkeahlian' : 'en/skill-exchange'}?message=${encodeURIComponent(msg)}&error=true`);
        }

        await Listing.create({
            title,
            description,
            category: category || 'other',
            type: type || 'offer',
            time_credit_cost: time_credit_cost ? parseFloat(time_credit_cost) : 0,
            user_id: req.user._id,
            status: 'active'
        });

        const successMsg = lang === 'id' ? 'Listing berhasil dibuat!' : 'Listing created successfully!';
        res.redirect(`/${lang === 'id' ? 'id/tukarkeahlian' : 'en/skill-exchange'}?message=${encodeURIComponent(successMsg)}`);

    } catch (error) {
        console.error('Error creating listing:', error);
        const errMsg = lang === 'id' ? 'Terjadi kesalahan saat membuat listing.' : 'An error occurred while creating listing.';
        res.redirect(`/${lang === 'id' ? 'id/tukarkeahlian' : 'en/skill-exchange'}?message=${encodeURIComponent(errMsg)}&error=true`);
    }
});

// Get messages untuk sebuah listing/room
router.get('/api/messages/:roomId', ensureAuthenticated, async (req, res) => {
    try {
        const messages = await Message.find({ room_id: req.params.roomId })
            .sort({ created_at: 1 })
            .limit(50);
        res.json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.json({ success: false, error: error.message });
    }
});

// Post message ke sebuah listing/room
router.post('/api/messages', ensureAuthenticated, async (req, res) => {
    const { roomId, message } = req.body;
    
    try {
        if (!roomId || !message || message.trim() === '') {
            return res.json({ success: false, error: 'Invalid room or message' });
        }

        const newMessage = await Message.create({
            room_id: roomId,
            user_id: req.user._id,
            username: req.user.username,
            message: message.trim()
        });

        res.json({ success: true, message: newMessage });
    } catch (error) {
        console.error('Error posting message:', error);
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;
