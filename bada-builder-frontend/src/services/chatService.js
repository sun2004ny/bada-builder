import { chatAPI } from './api';

/**
 * Generates a unique chat ID from property, buyer, and owner IDs
 * @param {string} propertyId - The property ID
 * @param {string} buyerId - The buyer's user ID
 * @param {string} ownerId - The owner's user ID
 * @returns {string} Unique chat identifier
 */
export const generateChatId = (propertyId, buyerId, ownerId) => {
    return `${propertyId}_${buyerId}_${ownerId}`;
};

/**
 * Creates a new chat or gets existing chat
 * @param {Object} chatData - Chat initialization data
 * @returns {Promise<Object>} Chat document data
 */
export const createOrGetChat = async (chatData) => {
    try {
        const response = await chatAPI.createOrGetChat({
            property_id: chatData.propertyId,
            owner_id: chatData.ownerId
        });

        const chat = response.chat;

        // Map backend fields to frontend expected fields
        return {
            chatId: chat.chat_id,
            propertyId: chat.property_id,
            propertyTitle: chatData.propertyTitle, // Use passed title as it may not be in chat table directly
            propertyImage: chatData.propertyImage || null,
            buyerId: chat.buyer_id,
            ownerId: chat.owner_id,
            lastMessage: chat.last_message,
            lastMessageTime: new Date(chat.last_message_time),
            unreadCount: {
                [chat.buyer_id]: chat.buyer_unread_count,
                [chat.owner_id]: chat.owner_unread_count
            }
        };
    } catch (error) {
        console.error('Error in createOrGetChat:', error);
        throw error;
    }
};

/**
 * Sends a message in a chat
 * @param {string} chatId - Chat identifier
 * @param {string} senderId - Sender's user ID
 * @param {string} senderName - Sender's name
 * @param {string} message - Message content
 * @param {Object} chatMetadata - Optional metadata to create chat if it doesn't exist
 * @returns {Promise<Object>}
 */
export const sendMessage = async (chatId, senderId, senderName, message, chatMetadata = null) => {
    try {
        // If metadata is provided, it's likely the first message
        // Ensure chat exists before sending message
        if (chatMetadata) {
            await createOrGetChat(chatMetadata);
        }
        return await chatAPI.sendMessage(chatId, message);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        throw error;
    }
};

/**
 * Sets up real-time listener for chat messages
 * @param {string} chatId - Chat identifier
 * @param {Function} callback - Callback function to receive messages
 * @returns {Function} Unsubscribe function
 */
export const getChatMessages = (chatId, callback) => {
    let isSubscribed = true;
    let pollInterval = null;

    const fetchMessages = async () => {
        if (!isSubscribed) return;
        try {
            const response = await chatAPI.getMessages(chatId);
            if (isSubscribed) {
                // Map backend message format if necessary
                const messages = Array.isArray(response.messages) ? response.messages.map(msg => ({
                    id: msg.timestamp, // or some unique id
                    senderId: msg.sender_id,
                    senderName: msg.sender_name,
                    message: msg.text,
                    timestamp: new Date(msg.timestamp)
                })) : [];
                callback(messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            if (isSubscribed) {
                callback([]); // Resolve loading even on error
            }
        }
    };

    // Initial fetch
    fetchMessages();

    // Start polling every 3 seconds
    pollInterval = setInterval(fetchMessages, 3000);

    return () => {
        isSubscribed = false;
        if (pollInterval) clearInterval(pollInterval);
    };
};

/**
 * Gets all chats for a user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to receive chats
 * @returns {Function} Unsubscribe function
 */
export const getUserChats = (userId, callback) => {
    let isSubscribed = true;
    let pollInterval = null;

    const fetchChats = async () => {
        if (!isSubscribed) return;
        try {
            const response = await chatAPI.getUserChats();
            if (isSubscribed) {
                const chats = Array.isArray(response.chats) ? response.chats.map(chat => ({
                    chatId: chat.chat_id,
                    propertyId: chat.property_id,
                    propertyTitle: chat.property_title,
                    propertyImage: chat.property_image,
                    buyerId: chat.buyer_id,
                    buyerName: chat.buyer_name,
                    ownerId: chat.owner_id,
                    ownerName: chat.owner_name,
                    lastMessage: chat.last_message,
                    lastMessageTime: new Date(chat.last_message_time),
                    unreadCount: {
                        [chat.buyer_id]: chat.buyer_unread_count,
                        [chat.owner_id]: chat.owner_unread_count
                    }
                })) : [];
                callback(chats);
            }
        } catch (error) {
            console.error('Error fetching user chats:', error);
            if (isSubscribed) {
                callback([]); // Resolve loading even on error
            }
        }
    };

    // Initial fetch
    fetchChats();

    // Start polling every 5 seconds
    pollInterval = setInterval(fetchChats, 5000);

    return () => {
        isSubscribed = false;
        if (pollInterval) clearInterval(pollInterval);
    };
};

/**
 * Marks chat messages as read for a user
 * @param {string} chatId - Chat identifier
 * @param {string} userId - User ID who read the messages
 * @returns {Promise<void>}
 */
export const markChatAsRead = async (chatId, userId) => {
    try {
        await chatAPI.markAsRead(chatId);
    } catch (error) {
        console.error('Error in markChatAsRead:', error);
    }
};

/**
 * Gets chat participant information
 * @param {string} chatId - Chat identifier
 * @returns {Promise<Object>} Chat data with participant info
 */
export const getChatParticipants = async (chatId) => {
    try {
        const response = await chatAPI.getMessages(chatId); // Backend currently returns basic info with messages
        // If we need more info, we might need a specific endpoint
        return response;
    } catch (error) {
        console.error('Error in getChatParticipants:', error);
        return null;
    }
};
