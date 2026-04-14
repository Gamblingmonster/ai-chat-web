const Session = require('../models/Session');
const Message = require('../models/Message');

/**
 * 获取所有会话列表
 */
exports.getSessions = async (req, res) => {
    try {
        const sessions = await Session.find().sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: '获取会话列表失败' });
    }
};

/**
 * 创建新会话
 */
exports.createSession = async (req, res) => {
    try {
        const { name } = req.body;
        const session = new Session({ name: name || '新会话' });
        await session.save();
        res.status(201).json(session);
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: '创建会话失败' });
    }
};

/**
 * 重命名会话
 */
exports.renameSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const session = await Session.findByIdAndUpdate(id, { name }, { new: true });
        if (!session) return res.status(404).json({ error: '会话不存在' });
        res.json(session);
    } catch (error) {
        console.error('Rename session error:', error);
        res.status(500).json({ error: '重命名失败' });
    }
};

/**
 * 删除会话及所属消息
 */
exports.deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        await Session.findByIdAndDelete(id);
        await Message.deleteMany({ sessionId: id });
        res.json({ message: '会话已删除' });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ error: '删除失败' });
    }
};

/**
 * 获取会话的所有消息
 */
exports.getSessionMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await Message.find({ sessionId: id }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: '获取消息失败' });
    }
};
