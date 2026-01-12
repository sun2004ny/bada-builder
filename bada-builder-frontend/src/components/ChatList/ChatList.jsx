import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserChats } from '../../services/chatService';
import { FiMessageSquare, FiUser } from 'react-icons/fi';
import './ChatList.css';

const ChatList = ({ onChatSelect }) => {
    const { currentUser } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'buyers', 'sellers'

    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        const unsubscribe = getUserChats(currentUser.uid, (userChats) => {
            setChats(userChats);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const now = new Date();
        const diff = now - date;

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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getOtherParticipant = (chat) => {
        if (chat.buyerId === currentUser?.uid) {
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
        return chat.unreadCount?.[currentUser?.uid] || 0;
    };

    const filteredChats = chats.filter(chat => {
        if (activeTab === 'all') return true;
        if (activeTab === 'buyers') return chat.ownerId === currentUser?.uid;
        if (activeTab === 'sellers') return chat.buyerId === currentUser?.uid;
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
                                key={chat.id}
                                className={`chat-item ${unreadCount > 0 ? 'chat-item-unread' : ''}`}
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
                                            <span className={`chat-item-role ${chat.buyerId !== currentUser?.uid ? 'role-client' : ''}`}>
                                                {chat.buyerId === currentUser?.uid ? 'Property Owner' : 'Client'}
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
