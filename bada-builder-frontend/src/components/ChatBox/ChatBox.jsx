import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    createOrGetChat,
    sendMessage,
    getChatMessages,
    markChatAsRead
} from '../../services/chatService';
import { FiSend, FiX } from 'react-icons/fi';
import './ChatBox.css';

const QUICK_MESSAGES = [
    "Is this property still available?",
    "Can we schedule a site visit?",
    "What's the best price you can offer?",
    "Are there any additional charges?",
    "Can I get more details about this property?"
];

const ChatBox = ({
    chatId,
    chatData,
    onClose,
    isOwner = false
}) => {
    const { currentUser, userProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize chat and load messages
    useEffect(() => {
        const initializeChat = async () => {
            try {
                setLoading(true);

                // Set up real-time message listener
                // Note: Listening to a collection that doesn't exist yet is valid in Firestore
                const unsubscribe = getChatMessages(chatId, (msgs) => {
                    setMessages(msgs);
                    setLoading(false);
                });

                // Mark chat as read when opened (only if chat exists)
                if (currentUser) {
                    await markChatAsRead(chatId, currentUser.uid);
                }

                return unsubscribe;
            } catch (error) {
                console.error('Error initializing chat:', error);
                setLoading(false);
            }
        };

        if (chatId && currentUser) {
            let unsub;
            initializeChat().then(cleanup => {
                unsub = cleanup;
            });
            return () => {
                if (unsub) unsub();
            };
        }
    }, [chatId, currentUser, isOwner]);

    // Auto-scroll to latest message
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !currentUser || sending) return;

        try {
            setSending(true);
            await sendMessage(
                chatId,
                currentUser.uid,
                userProfile?.name || currentUser.email,
                newMessage.trim(),
                !isOwner ? chatData : null // Pass metadata only for buyer's first message
            );
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleQuickMessage = (message) => {
        setNewMessage(message);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="chat-box">
            {/* Chat Header */}
            <div className="chat-header">
                <div className="chat-header-info">
                    {chatData?.propertyImage && (
                        <img
                            src={chatData.propertyImage}
                            alt={chatData.propertyTitle}
                            className="chat-property-thumb"
                        />
                    )}
                    <div>
                        <h3 className="chat-property-title">
                            {chatData?.propertyTitle || 'Chat'}
                        </h3>
                        <p className="chat-participant-name">
                            {isOwner
                                ? `Chat with ${chatData?.buyerName}`
                                : `Chat with ${chatData?.ownerName}`}
                        </p>
                    </div>
                </div>
                <button className="chat-close-btn" onClick={onClose}>
                    <FiX />
                </button>
            </div>

            {/* Messages Area */}
            <div className="chat-messages">
                {loading ? (
                    <div className="chat-loading">
                        <div className="chat-loader"></div>
                        <p>Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="chat-empty">
                        <p>No messages yet. Start the conversation!</p>
                        {!isOwner && (
                            <div className="quick-messages">
                                <p className="quick-messages-label">Quick messages:</p>
                                {QUICK_MESSAGES.map((msg, idx) => (
                                    <button
                                        key={idx}
                                        className="quick-message-btn"
                                        onClick={() => handleQuickMessage(msg)}
                                    >
                                        {msg}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message ${msg.senderId === currentUser?.uid ? 'message-sent' : 'message-received'
                                    }`}
                            >
                                <div className="message-bubble">
                                    <p className="message-text">{msg.message}</p>
                                    <span className="message-time">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Quick Messages (shown when no messages and buyer) */}
            {!isOwner && messages.length === 0 && !loading && (
                <div className="quick-messages-bottom">
                    {QUICK_MESSAGES.slice(0, 3).map((msg, idx) => (
                        <button
                            key={idx}
                            className="quick-message-chip"
                            onClick={() => handleQuickMessage(msg)}
                        >
                            {msg}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!newMessage.trim() || sending}
                >
                    {sending ? (
                        <div className="chat-send-loader"></div>
                    ) : (
                        <FiSend />
                    )}
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
