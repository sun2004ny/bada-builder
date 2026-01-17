import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * Get all chats for the authenticated user
 */
router.get('/user-chats', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch chats where the user is either buyer or owner
        const result = await pool.query(
            `SELECT * FROM chats 
             WHERE buyer_id = $1 OR owner_id = $1
             ORDER BY last_message_time DESC`,
            [userId]
        );

        res.json({ chats: result.rows });
    } catch (error) {
        console.error('Get user chats error:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});

/**
 * Create or get a chat
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { property_id, owner_id } = req.body;
        const buyer_id = req.user.id;

        if (buyer_id === owner_id) {
            return res.status(400).json({ error: 'You cannot chat with yourself' });
        }

        // Check if chat already exists
        let result = await pool.query(
            'SELECT * FROM chats WHERE property_id = $1::text AND buyer_id = $2 AND owner_id = $3',
            [property_id, buyer_id, owner_id]
        );

        if (result.rows.length > 0) {
            return res.json({ chat: result.rows[0], isNew: false });
        }

        // Fetch property details to populate the chat record
        const propResult = await pool.query('SELECT title, image_url FROM properties WHERE id = $1', [property_id]);
        const property = propResult.rows[0] || {};

        // Fetch user details
        const buyerResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [buyer_id]);
        const ownerResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [owner_id]);
        const buyer = buyerResult.rows[0] || {};
        const owner = ownerResult.rows[0] || {};

        // Create new chat
        const id = crypto.randomUUID();
        const chatId = `${property_id}_${buyer_id}_${owner_id}`;

        const newChat = await pool.query(
            `INSERT INTO chats (
                id, chat_id, property_id, property_title, property_image,
                buyer_id, buyer_name, buyer_email,
                owner_id, owner_name, owner_email,
                messages, last_message, last_message_time,
                buyer_unread_count, owner_unread_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, $14, $15)
            RETURNING *`,
            [
                id, chatId, property_id.toString(), property.title || 'Property', property.image_url || '',
                buyer_id, buyer.name || '', buyer.email || '',
                owner_id, owner.name || '', owner.email || '',
                JSON.stringify([]), '', 0, 0
            ]
        );

        res.status(201).json({ chat: newChat.rows[0], isNew: true });
    } catch (error) {
        console.error('Create/get chat error:', error);
        res.status(500).json({ error: 'Failed to create or get chat' });
    }
});

/**
 * Send a message
 */
router.post('/:chatId/message', authenticate, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { message } = req.body;
        const senderId = req.user.id;

        // Get the chat
        const chatResult = await pool.query('SELECT * FROM chats WHERE chat_id = $1', [chatId]);
        if (chatResult.rows.length === 0) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const chat = chatResult.rows[0];

        // Ensure user is part of the chat (Cast to string to avoid type mismatch)
        if (String(chat.buyer_id) !== String(senderId) && String(chat.owner_id) !== String(senderId)) {
            return res.status(403).json({ error: 'Unauthorized to send message in this chat' });
        }

        const newMessage = {
            sender_id: senderId,
            sender_name: req.user.name,
            text: message,
            timestamp: new Date().toISOString()
        };

        // Update messages array and unread counts
        let updateQuery = '';
        let params = [];

        if (senderId === chat.buyer_id) {
            // Buyer sent the message, Increment owner's unread count
            updateQuery = `
                UPDATE chats 
                SET messages = COALESCE(messages, '[]'::jsonb) || $1::jsonb,
                    last_message = $2,
                    last_message_time = CURRENT_TIMESTAMP,
                    owner_unread_count = COALESCE(owner_unread_count, 0) + 1
                WHERE chat_id = $3
                RETURNING *`;
            params = [JSON.stringify(newMessage), message, chatId];
        } else {
            // Owner sent the message, Increment buyer's unread count
            updateQuery = `
                UPDATE chats 
                SET messages = COALESCE(messages, '[]'::jsonb) || $1::jsonb,
                    last_message = $2,
                    last_message_time = CURRENT_TIMESTAMP,
                    buyer_unread_count = COALESCE(buyer_unread_count, 0) + 1
                WHERE chat_id = $3
                RETURNING *`;
            params = [JSON.stringify(newMessage), message, chatId];
        }

        const updatedChat = await pool.query(updateQuery, params);
        res.json({ message: newMessage, chat: updatedChat.rows[0] });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

/**
 * Fetch chat messages
 */
router.get('/:chatId/messages', authenticate, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT messages, buyer_id, owner_id FROM chats WHERE chat_id = $1',
            [chatId]
        );

        if (result.rows.length === 0) {
            // Return empty messages instead of 404 if chat doesn't exist yet
            return res.json({ messages: [] });
        }

        const chat = result.rows[0];
        if (String(chat.buyer_id) !== String(userId) && String(chat.owner_id) !== String(userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json({ messages: chat.messages || [] });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * Mark chat as read
 */
router.patch('/:chatId/read', authenticate, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        // Get the chat
        const chatResult = await pool.query('SELECT buyer_id, owner_id FROM chats WHERE chat_id = $1', [chatId]);
        if (chatResult.rows.length === 0) {
            // If chat doesn't exist, there are no unread messages anyway
            return res.json({ success: true, message: 'Chat does not exist yet' });
        }

        const chat = chatResult.rows[0];
        let updateQuery = '';

        if (String(userId) === String(chat.buyer_id)) {
            updateQuery = 'UPDATE chats SET buyer_unread_count = 0 WHERE chat_id = $1';
        } else if (String(userId) === String(chat.owner_id)) {
            updateQuery = 'UPDATE chats SET owner_unread_count = 0 WHERE chat_id = $1';
        } else {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await pool.query(updateQuery, [chatId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

export default router;
