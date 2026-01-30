import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserChats } from '../../services/chatService';
import { FiMessageSquare, FiUser } from 'react-icons/fi';
import './ChatList.css';

const ChatList = ({ onChatSelect, activeChatId, refreshTrigger, realTimeChatUpdate }) => {
    const { currentUser } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'buyers', 'sellers'

    useEffect(() => {
        if (!currentUser) return;

        // Don't show loading spinner on background refresh (refreshTrigger > 0)
        if (refreshTrigger === 0) setLoading(true);
        
        const unsubscribe = getUserChats(currentUser.uid, (userChats) => {
            setChats(userChats);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, refreshTrigger]);

    // Handle real-time updates
    useEffect(() => {
        if (realTimeChatUpdate) {
            setChats(prevChats => {
                // Parse timestamp logically
                let msgTime = realTimeChatUpdate.last_message_time;
                if (typeof msgTime === 'string') {
                    // Normalize to ISO format (replace space with T)
                    msgTime = msgTime.replace(' ', 'T');
                    // Ensure it ends with Z to force UTC
                    if (!msgTime.endsWith('Z') && !msgTime.includes('+')) {
                        msgTime += 'Z';
                    }
                }

                // Map backend chat object to frontend format
                const updatedChatFormatted = {
                    chatId: realTimeChatUpdate.chat_id,
                    propertyId: realTimeChatUpdate.property_id,
                    propertyTitle: realTimeChatUpdate.property_title,
                    propertyImage: realTimeChatUpdate.property_image,
                    buyerId: realTimeChatUpdate.buyer_id,
                    buyerName: realTimeChatUpdate.buyer_name,
                    ownerId: realTimeChatUpdate.owner_id,
                    ownerName: realTimeChatUpdate.owner_name,
                    lastMessage: realTimeChatUpdate.last_message,
                    lastMessageTime: new Date(msgTime),
                    unreadCount: {
                        [realTimeChatUpdate.buyer_id]: realTimeChatUpdate.buyer_unread_count,
                        [realTimeChatUpdate.owner_id]: realTimeChatUpdate.owner_unread_count
                    }
                };

                // Check if chat exists
                const existingIndex = prevChats.findIndex(c => c.chatId === updatedChatFormatted.chatId);
                
                let newChats;
                if (existingIndex >= 0) {
                    newChats = [...prevChats];
                    newChats[existingIndex] = updatedChatFormatted;
                } else {
                    newChats = [updatedChatFormatted, ...prevChats];
                }
                
                // Re-sort by time
                return newChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
            });
        }
    }, [realTimeChatUpdate]);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Less than 1 minute
        if (diff < 60000) return 'Just now';

        // Less than 1 minute
        if (diff < 60000) return 'Just now';

        // Less than 1 hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins}m ago`;
        }

        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }

        // Less than 7 days
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }

        // Show date
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
    };

    const getOtherParticipant = (chat) => {
        if (String(chat.buyerId) === String(currentUser?.uid)) {
            return {
                name: chat.ownerName,
                email: chat.ownerEmail
            };
        }
        return {
            name: chat.buyerName,
            email: chat.buyerEmail
        };
    };

    const getUnreadCount = (chat) => {
        return chat.unreadCount?.[String(currentUser?.uid)] || 0;
    };

    const filteredChats = chats.filter(chat => {
        if (activeTab === 'all') return true;
        if (activeTab === 'buyers') return String(chat.ownerId) === String(currentUser?.uid);
        if (activeTab === 'sellers') return String(chat.buyerId) === String(currentUser?.uid);
        return true;
    });

    const getEmptyStateMessage = () => {
        if (activeTab === 'buyers') return "No client inquiries yet";
        if (activeTab === 'sellers') return "No property owner chats yet";
        return "Your property inquiries will appear here";
    };

    if (loading) {
        return (
            <div className="chat-list-loading">
                <div className="chat-list-loader"></div>
                <p>Loading your chats...</p>
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="chat-list-empty">
                <FiMessageSquare size={60} />
                <h3>No Chats Yet</h3>
                <p>Your property inquiries will appear here</p>
            </div>
        );
    }

    return (
        <div className="chat-list-container">
            <div className="chat-tabs-bar">
                <button
                    className={`chat-tab-btn tab-all ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All
                </button>
                <button
                    className={`chat-tab-btn tab-buyers ${activeTab === 'buyers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('buyers')}
                >
                    Buyers
                </button>
                <button
                    className={`chat-tab-btn tab-sellers ${activeTab === 'sellers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sellers')}
                >
                    Sellers
                </button>
            </div>

            <div className="chat-list">
                {filteredChats.length > 0 ? (
                    filteredChats.map((chat) => {
                        const otherParticipant = getOtherParticipant(chat);
                        const unreadCount = getUnreadCount(chat);

                        return (
                            <div
                                key={chat.chatId}
                                className={`chat-item ${unreadCount > 0 ? 'chat-item-unread' : ''} ${ activeChatId === chat.chatId ? 'active' : ''}`}
                                onClick={() => onChatSelect(chat)}
                            >
                                <div className="chat-item-avatar">
                                    {chat.propertyImage ? (
                                        <img src={chat.propertyImage} alt={chat.propertyTitle} />
                                    ) : (
                                        <div className="chat-item-avatar-placeholder">
                                            <FiUser />
                                        </div>
                                    )}
                                </div>

                                <div className="chat-item-content">
                                    <div className="chat-item-header">
                                        <h4 className="chat-item-title">{chat.propertyTitle}</h4>
                                        <span className="chat-item-time">
                                            {formatTimestamp(chat.lastMessageTime)}
                                        </span>
                                    </div>

                                    <div className="chat-item-details">
                                        <div className="chat-item-participant-row">
                                            <p className="chat-item-participant">
                                                <FiUser size={12} />
                                                {otherParticipant.name}
                                            </p>
                                            <span className={`chat-item-role ${String(chat.buyerId) !== String(currentUser?.uid) ? 'role-client' : ''}`}>
                                                {String(chat.buyerId) === String(currentUser?.uid) ? 'Property Owner' : 'Client'}
                                            </span>
                                        </div>
                                        <p className="chat-item-last-message">
                                            {chat.lastMessage || 'No messages yet'}
                                        </p>
                                    </div>
                                </div>

                                {unreadCount > 0 && (
                                    <div className="chat-item-unread-badge">
                                        {unreadCount}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="chat-list-empty mini">
                        <FiMessageSquare size={40} />
                        <p>{getEmptyStateMessage()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;
