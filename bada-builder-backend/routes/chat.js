import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import crypto from 'crypto';
import { getIO } from '../utils/socket.js';
import { sendEmail } from '../utils/sendEmail.js';

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

        if (!property_id || !owner_id) {
            return res.status(400).json({ error: 'Missing property_id or owner_id' });
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
        let property = {};
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(property_id);

        if (isUUID) {
             const propResult = await pool.query('SELECT title, images FROM short_stay_properties WHERE id = $1', [property_id]);
             if (propResult.rows.length > 0) {
                 const p = propResult.rows[0];
                 property = {
                     title: p.title,
                     image_url: p.images && p.images.length > 0 ? p.images[0] : ''
                 };
             }
        } else {
             const propResult = await pool.query('SELECT title, image_url FROM properties WHERE id = $1', [property_id]);
             property = propResult.rows[0] || {};
        }

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

        const chatData = newChat.rows[0];

        // Socket.io: Emit new chat event
        const io = getIO();
        io.to(String(owner_id)).emit('new_chat', { chat: chatData });

        // Email Notification to Owner
        try {
            if (owner.email) {
                const subject = `New Inquiry: ${property.title || 'Property'}`;
                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>New Inquiry for ${property.title}</h2>
                        <p><strong>${buyer.name || 'A user'}</strong> has started a chat regarding your property.</p>
                        <a href="${process.env.FRONTEND_URL}/hosting/messages" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Message</a>
                    </div>
                `;
                sendEmail({
                    to: owner.email,
                    subject,
                    htmlContent,
                    recipientName: owner.name
                }).catch(console.error);
            }
        } catch (e) { console.error(e); }

        res.status(201).json({ chat: chatData, isNew: true });
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

        if (String(senderId) === String(chat.buyer_id)) {
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
        
        // Socket.io: Emit new message event to the chat room or specific users
        const io = getIO();
        const receiverId = senderId === chat.buyer_id ? chat.owner_id : chat.buyer_id;
        
        // Emit to the specific user's room (if they are online)
        io.to(String(receiverId)).emit('new_message', {
            chatId,
            message: newMessage,
            chat: updatedChat.rows[0]
        });

        // Also emit to sender (optional, for multi-device sync)
        io.to(String(senderId)).emit('new_message', {
            chatId,
            message: newMessage,
            chat: updatedChat.rows[0]
        });

        // Email Notification
        try {
            const recipientUserStart = await pool.query('SELECT email, name FROM users WHERE id = $1', [receiverId]);
            const recipientUser = recipientUserStart.rows[0];

            if (recipientUser && recipientUser.email) {
                const subject = `New Message from ${req.user.name} - ${chat.property_title}`;
                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>New Message regarding ${chat.property_title}</h2>
                        <p><strong>${req.user.name}</strong> sent you a message:</p>
                        <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff;">
                            ${message}
                        </blockquote>
                        <a href="${process.env.FRONTEND_URL}/messages" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reply Now</a>
                    </div>
                `;
                
                // Fire and forget email (don't await to not block response)
                sendEmail({
                    to: recipientUser.email,
                    subject,
                    htmlContent,
                    recipientName: recipientUser.name
                }).catch(err => console.error('Failed to send message notification email:', err));
            }
        } catch (emailErr) {
            console.error('Error in email notification logic:', emailErr);
        }

        res.json({ message: newMessage, chat: updatedChat.rows[0] });

// ... (rest of file)
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
