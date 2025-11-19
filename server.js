// server.js
require('dotenv').config(); // Load environment variables dari .env file
const config = require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./config/passport');

const app = express();
const server = http.createServer(app); // Buat server HTTP dari aplikasi Express
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
}); // Inisialisasi Socket.io dengan CORS

// Setup EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- 1. Konfigurasi Database (MongoDB) ---
mongoose.connect(config.DB_URI)
  .then(() => console.log('✓ MongoDB connected successfully.'))
  .catch(err => console.error('✗ DB Connection Error:', err.message));

// --- 2. Middleware Static Files & Body Parser ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- 3. Middleware Session & Passport ---
app.use(session({
    secret: config.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// --- 4. Middleware Global untuk Status Login & User ---
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user || null;
    res.locals.message = req.query.message || null;
    res.locals.isError = req.query.error === 'true';
    next();
});

// --- 5. Middleware untuk Bahasa (Language) ---
app.use((req, res, next) => {
    const segments = req.path.split('/');
    const lang = segments[1] === 'en' ? 'en' : 'id';
    res.locals.lang = lang;
    next();
});

// --- 6. Setup Routes ---
const mainRoutes = require('./routes/mainRoutes');
app.use('/', mainRoutes);

// --- 7. Socket.io untuk Chat ---
io.on('connection', (socket) => {
  console.log('A user connected to chat. Socket ID:', socket.id);

  // Handle join room event
  socket.on('join room', (roomId) => {
    console.log(`[Socket ${socket.id}] Join room event received:`, roomId);
    if (roomId) {
      socket.join(roomId);
      console.log(`✓ User ${socket.id} joined room: ${roomId}`);
      socket.to(roomId).emit('chat message', { 
        user: 'System', 
        message: 'Pengguna baru telah bergabung' 
      });
    }
  });

  // Handle chat message
  socket.on('chat message', (msg) => {
    console.log(`[Socket ${socket.id}] Chat message received:`, msg);
    if (msg && msg.room) {
      // Emit hanya ke room tersebut
      io.to(msg.room).emit('chat message', msg);
      console.log(`✓ Message sent to room ${msg.room}: ${msg.user} - ${msg.message}`);
    } else {
      console.log(`✗ Invalid message format or no room specified`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected from chat.`);
  });

  socket.on('error', (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });
});

// --- 8. Jalankan Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  require('./models/userModel').seedAdminUser();
});