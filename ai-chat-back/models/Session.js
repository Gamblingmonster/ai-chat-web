const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '新会话'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 每次更新前更新 updatedAt
SessionSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Session', SessionSchema);
