// config/config.js

// Load environment variables dari .env file
// Untuk development: gunakan .env file
// Untuk production: gunakan environment variables sistem

const config = {
    // --- Konfigurasi Server ---
    PORT: process.env.PORT || 3000,
    
    // --- Konfigurasi Database (MongoDB) ---
    // Dari .env: MONGODB_URI=mongodb+srv://user:password@cluster...
    // Fallback ke lokal: mongodb://localhost:27017/kirakiraDB
    DB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/kirakiraDB',
    
    // --- Konfigurasi Keamanan ---
    // SECRET_KEY untuk session dan authentication
    SECRET_KEY: process.env.SESSION_SECRET || 'kunci_rahasia_development_ubah_di_production',
    
    // Konfigurasi Bcrypt
    BCRYPT_SALT_ROUNDS: 10,
    
    // --- Konfigurasi Akun Admin Default ---
    ADMIN_USER: {
        username: 'roro_admin',
        email: 'roro@pancadaya.com',
        password: 'AdminSuperAmanPancadaya2025!', 
        role: 'admin'
    }
};

// Debug: show which DB_URI is being used
if (process.env.NODE_ENV !== 'production') {
    console.log('📍 Using DB_URI from:', process.env.MONGODB_URI ? '.env file' : 'default (localhost)');
}

module.exports = config;