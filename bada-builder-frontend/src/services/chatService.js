import {
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

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
 * @param {string} chatData.chatId - Unique chat identifier
 * @param {string} chatData.propertyId - Property ID
 * @param {string} chatData.propertyTitle - Property title
 * @param {string} chatData.propertyImage - Property image URL (optional)
 * @param {string} chatData.buyerId - Buyer user ID
 * @param {string} chatData.buyerName - Buyer name
 * @param {string} chatData.buyerEmail - Buyer email
 * @param {string} chatData.ownerId - Owner user ID
 * @param {string} chatData.ownerName - Owner name
 * @param {string} chatData.ownerEmail - Owner email
 * @returns {Promise<Object>} Chat document data
 */
export const createOrGetChat = async (chatData) => {
    try {
        const chatRef = doc(db, 'chats', chatData.chatId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
            return chatDoc.data();
        }

        // Create new chat
        const newChat = {
            chatId: chatData.chatId,
            propertyId: chatData.propertyId,
            propertyTitle: chatData.propertyTitle,
            propertyImage: chatData.propertyImage || null,
            buyerId: chatData.buyerId,
            buyerName: chatData.buyerName,
            buyerEmail: chatData.buyerEmail,
            ownerId: chatData.ownerId,
            ownerName: chatData.ownerName,
            ownerEmail: chatData.ownerEmail,
            participants: [chatData.buyerId, chatData.ownerId],
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            createdAt: serverTimestamp(),
            unreadCount: {
                [chatData.buyerId]: 0,
                [chatData.ownerId]: 0
            }
        };

        await setDoc(chatRef, newChat);
        return newChat;
    } catch (error) {
        console.error('Error creating/getting chat:', error);
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
 * @returns {Promise<void>}
 */
export const sendMessage = async (chatId, senderId, senderName, message, chatMetadata = null) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        let chatDoc = await getDoc(chatRef);

        if (!chatDoc.exists()) {
            if (chatMetadata) {
                await createOrGetChat(chatMetadata);
                chatDoc = await getDoc(chatRef);
            } else {
                console.warn('Chat document does not exist and no metadata provided.');
                // We still try to send the message, but unreadCount/lastMessage update might fail
            }
        }

        const messagesRef = collection(db, 'chats', chatId, 'messages');

        // Add message to subcollection
        await addDoc(messagesRef, {
            senderId,
            senderName,
            message,
            timestamp: serverTimestamp(),
            read: false
        });

        // Update chat document with last message info
        if (chatDoc.exists()) {
            const chatData = chatDoc.data();
            const recipientId = chatData.participants.find(id => id !== senderId);

            await updateDoc(chatRef, {
                lastMessage: message,
                lastMessageTime: serverTimestamp(),
                [`unreadCount.${recipientId}`]: (chatData.unreadCount?.[recipientId] || 0) + 1
            });
        }
    } catch (error) {
        console.error('Error sending message:', error);
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
    try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date()
            }));
            callback(messages);
        }, (error) => {
            console.error('Error listening to messages:', error);
            callback([]);
        });
    } catch (error) {
        console.error('Error setting up message listener:', error);
        return () => { };
    }
};

/**
 * Gets all chats for a user (owner)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to receive chats
 * @returns {Function} Unsubscribe function
 */
export const getUserChats = (userId, callback) => {
    try {
        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('participants', 'array-contains', userId),
            orderBy('lastMessageTime', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date()
            }));
            callback(chats);
        }, (error) => {
            console.error('Error listening to chats:', error);
            callback([]);
        });
    } catch (error) {
        console.error('Error setting up chat listener:', error);
        return () => { };
    }
};

/**
 * Marks chat messages as read for a user
 * @param {string} chatId - Chat identifier
 * @param {string} userId - User ID who read the messages
 * @returns {Promise<void>}
 */
export const markChatAsRead = async (chatId, userId) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            [`unreadCount.${userId}`]: 0
        });
    } catch (error) {
        console.error('Error marking chat as read:', error);
    }
};

/**
 * Gets chat participant information
 * @param {string} chatId - Chat identifier
 * @returns {Promise<Object>} Chat data with participant info
 */
export const getChatParticipants = async (chatId) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
            return chatDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting chat participants:', error);
        return null;
    }
};
