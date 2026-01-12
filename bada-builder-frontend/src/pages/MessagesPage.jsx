import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatList from '../components/ChatList/ChatList';
import ChatBox from '../components/ChatBox/ChatBox';
import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import './MessagesPage.css';

const MessagesPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    const handleBackToProfile = () => {
        navigate('/profile');
    };

    const handleCloseChat = () => {
        setSelectedChat(null);
    };

    return (
        <div className="messages-page-container">
            <header className="messages-page-header">
                <button className="messages-back-btn" onClick={handleBackToProfile}>
                    <FiArrowLeft size={20} />
                    <span>Back to Profile</span>
                </button>
                <h1 className="messages-page-title">Messages</h1>
                <div style={{ width: '140px' }}></div> {/* Spacer for symmetry */}
            </header>

            <div className="messages-layout">
                <div className="messages-list-pane">
                    <ChatList onChatSelect={handleChatSelect} selectedChatId={selectedChat?.id} />
                </div>

                <div className={`messages-content-pane ${selectedChat ? 'active' : ''}`}>
                    {selectedChat ? (
                        <ChatBox
                            chatId={selectedChat.id}
                            chatData={selectedChat}
                            onClose={handleCloseChat}
                            isOwner={selectedChat.ownerId === currentUser?.uid}
                        />
                    ) : (
                        <div className="messages-empty-state">
                            <div className="messages-empty-icon">
                                <FiMessageSquare />
                            </div>
                            <h2>Your Conversations</h2>
                            <p>Select a chat from the list to start messaging.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
