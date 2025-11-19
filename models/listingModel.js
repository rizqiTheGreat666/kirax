// models/listingModel.js

const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: {
        type: String,
        enum: ['offer', 'request'],
        default: 'offer'
    },
    time_credit_cost: {
        type: Number,
        default: 0
    },
    category: { 
        type: String, 
        enum: ['programming', 'design', 'writing', 'marketing', 'teaching', 'other'],
        default: 'other'
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Listing', listingSchema);
