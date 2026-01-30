import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    sendMessage,
    getChatMessages,
    markChatAsRead
} from '../../services/chatService';
import { getSocket } from '../../services/socketService';
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
    const chatContainerRef = useRef(null);

    // Initialize chat and load messages
    useEffect(() => {
        const initializeChat = async () => {
            try {
                setLoading(true);
                const unsubscribe = getChatMessages(chatId, (msgs) => {
                    setMessages(msgs);
                    setLoading(false);
                });

                if (currentUser) {
                    await markChatAsRead(chatId, String(currentUser.uid));
                }

                return unsubscribe;
            } catch (error) {
                console.error('Error initializing chat:', error);
                setLoading(false);
            }
        };

        if (chatId && currentUser) {
            let unsub;
            initializeChat().then(cleanup => unsub = cleanup);
            
            // Socket.io Listener
            const socket = getSocket();
            if (socket) {
                const handleNewMessage = (data) => {
                    if (data.chatId === chatId) {
                        setMessages((prev) => {
                            // Avoid duplicates just in case
                            const exists = prev.some(m => m.timestamp === data.message.timestamp && m.text === data.message.text);
                            if (exists) return prev;
                            const newMsg = {
                                ...data.message,
                                id: Date.now(), // Temp ID until refresh
                                message: data.message.text // Map text to message prop if needed, or fix backend to send consistent format
                            };
                            return [...prev, newMsg];
                        });
                        
                        // Mark as read immediately if chat is open
                        markChatAsRead(chatId, String(currentUser.uid));
                    }
                };
                
                socket.on('new_message', handleNewMessage);
                
                return () => {
                    if (unsub) unsub();
                    socket.off('new_message', handleNewMessage);
                };
            }
            
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
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !currentUser || sending) return;

        try {
            setSending(true);
            const response = await sendMessage(
                chatId,
                String(currentUser.uid),
                userProfile?.name || currentUser.email,
                newMessage.trim(),
                !isOwner ? chatData : null // Pass metadata only for buyer's first message
            );
            
            // Optimistic update using backend response
            if (response && response.message) {
                const sentMsg = response.message;
                const newMsgFormatted = {
                    id: sentMsg.timestamp || Date.now(),
                    senderId: sentMsg.sender_id,
                    senderName: sentMsg.sender_name,
                    message: sentMsg.text,
                    timestamp: new Date(sentMsg.timestamp)
                };
                
                setMessages(prev => {
                    // Check for duplicates (in case socket event arrived first)
                    if (prev.some(m => m.id === newMsgFormatted.id || (m.timestamp && new Date(m.timestamp).getTime() === newMsgFormatted.timestamp.getTime()))) {
                        return prev;
                    }
                    return [...prev, newMsgFormatted];
                });
            }

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
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
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
            <div className="chat-messages" ref={chatContainerRef}>
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
                                className={`message ${String(msg.senderId) === String(currentUser?.uid) ? 'message-sent' : 'message-received'
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
                        <div />
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
