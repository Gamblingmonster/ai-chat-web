const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: null
    },
    isThinking: {
        type: Boolean,
        default: false
    },
    file: {
        name: String,
        filename: String,
        parsed_content: String,
        mimetype: String,
        size: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);
