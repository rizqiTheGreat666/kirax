// models/messageModel.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Listing',
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Message', messageSchema);
