import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCheckCircle } from 'react-icons/fi';
import './Toast.css';

const Toast = ({ message, isVisible, onClose, onClick }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // 5 seconds duration
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return createPortal(
        <div className="custom-toast-notification" onClick={onClick} role="alert">
            <FiCheckCircle size={20} className="toast-icon" />
            <span className="toast-message">{message}</span>
        </div>,
        document.body
    );
};

export default Toast;
