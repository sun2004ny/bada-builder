import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatList from '../../components/ChatList/ChatList';
import ChatBox from '../../components/ChatBox/ChatBox';
import { initSocket } from '../../services/socketService';
import { FiMessageSquare } from 'react-icons/fi';
import './HostingMessages.css';

const HostingMessages = () => {
    const { currentUser } = useAuth();
    const [selectedChat, setSelectedChat] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'chat' (for mobile responsiveness)
    const [realTimeChatUpdate, setRealTimeChatUpdate] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (currentUser) {
            const socket = initSocket(currentUser.uid);
            
            // Listen for new messages to update the list/order
            const handleNewMessage = (data) => {
                console.log('New message received:', data);
                // If the event brings the full updated chat object, use it
                if (data.chat) {
                    setRealTimeChatUpdate(data.chat);
                }
                setRefreshTrigger(prev => prev + 1); // Keep trigger for other side effects
            };

            socket.on('new_message', handleNewMessage);

            return () => {
                socket.off('new_message', handleNewMessage);
            };
        }
    }, [currentUser]);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        setView('chat');
    };

    const handleBackToList = () => {
        setSelectedChat(null);
        setView('list');
    };

    return (
        <div className="hosting-dashboard-container">
            <div className="hosting-messages-wrapper">
                {/* Sidebar / Chat List */}
                <div className={`hm-sidebar ${view === 'list' ? 'active' : ''}`}>
                    <div className="hm-sidebar-header">
                        <h2>Messages</h2>
                    </div>
                    <div className="hm-chat-list-container">
                        <ChatList 
                            onChatSelect={handleChatSelect} 
                            activeChatId={selectedChat?.chatId} 
                            refreshTrigger={refreshTrigger}
                            realTimeChatUpdate={realTimeChatUpdate}
                        />
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={`hm-main-area ${view === 'chat' ? 'active' : ''}`}>
                    {selectedChat ? (
                        <ChatBox 
                            chatId={selectedChat.chatId} 
                            chatData={selectedChat} 
                            onClose={handleBackToList}
                            isOwner={true}
                        />
                    ) : (
                        <div className="hm-empty-state">
                            <div className="hm-empty-icon">
                                <FiMessageSquare size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Your messages</h3>
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HostingMessages;
