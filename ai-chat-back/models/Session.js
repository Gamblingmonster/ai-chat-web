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

// 每次更新会话名或有新消息时更新 updatedAt
SessionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Session', SessionSchema);
