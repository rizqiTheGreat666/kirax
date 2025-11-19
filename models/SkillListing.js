// models/SkillListing.js

const mongoose = require('mongoose');

const SkillListingSchema = new mongoose.Schema({
    // ID Pengguna yang memposting listing
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referensi ke model User
        required: true,
    },
    // Tipe: 'offer' (Menawarkan Keahlian) atau 'request' (Meminta Keahlian)
    type: {
        type: String,
        enum: ['offer', 'request'],
        required: true,
    },
    // Judul listing (e.g., "Membantu Desain Logo", "Mencari Tutor Bahasa Inggris")
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 100,
    },
    // Deskripsi detail keahlian atau kebutuhan
    description: {
        type: String,
        required: true,
        maxlength: 500,
    },
    // Kategori Keahlian (e.g., "TI", "Seni", "Bahasa", "Pertukangan")
    category: {
        type: String,
        trim: true,
        required: true,
    },
    // Perkiraan biaya dalam Waktu Kredit (Jam)
    time_credit_cost: {
        type: Number,
        min: 0.5, // Minimal 30 menit
        required: true,
    },
    // Status Listing: 'active' (masih tersedia), 'fulfilled' (sudah dipenuhi/ditutup)
    status: {
        type: String,
        enum: ['active', 'fulfilled'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SkillListing', SkillListingSchema);