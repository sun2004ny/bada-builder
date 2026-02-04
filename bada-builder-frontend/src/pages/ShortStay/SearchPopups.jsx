import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaMinus, FaAngleLeft, FaAngleRight } from 'react-icons/fa';

/**
 * Robust Date Picker with Airbnb Aesthetics
 * Fixes off-by-one and timezone issues by using local date parts.
 */
export const CalendarPopup = ({ checkIn, checkOut, onChange, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    const popupRef = useRef(null);

    // Detect mobile for Portal usage
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If checking mobile portal, rely on overlay or ensure event delegation works
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        // Use capture phase to ensure we catch clicks even in portal
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, [onClose]);

    const getDaysInMonth = (year, month) => {
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const handleDateClick = (date) => {
        const dStr = formatDate(date);

        if (!checkIn || (checkIn && checkOut)) {
            // Starting new selection
            onChange({ checkIn: dStr, checkOut: '' });
        } else {
            // Completing selection
            if (dStr < checkIn) {
                // Selected date is before check-in, rotate
                onChange({ checkIn: dStr, checkOut: '' });
            } else {
                onChange({ checkOut: dStr });
                // Close after a short delay for better UX
                setTimeout(onClose, 300);
            }
        }
    };

    const renderMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = getDaysInMonth(year, month);
        const firstDayIdx = new Date(year, month, 1).getDay();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            <div className="calendar-month">
                <div className="month-name">
                    {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="calendar-grid">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="calendar-weekday">{d}</div>
                    ))}
                    {Array(firstDayIdx).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} className="calendar-day empty" />
                    ))}
                    {days.map(d => {
                        const dStr = formatDate(d);
                        const isSelected = dStr === checkIn || dStr === checkOut;
                        const isInRange = checkIn && checkOut && dStr > checkIn && dStr < checkOut;
                        const isDisabled = d < today;

                        return (
                            <button
                                key={dStr}
                                className={`calendar-day ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''}`}
                                disabled={isDisabled}
                                onClick={() => handleDateClick(d)}
                            >
                                {d.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

    const popupContent = (
        <div
            className="calendar-popup"
            ref={popupRef}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="calendar-nav">
                <button className="nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                    <FaAngleLeft />
                </button>
                <button className="nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                    <FaAngleRight />
                </button>
            </div>
            <div className="calendar-container">
                {renderMonth(currentMonth)}
                <div className="month-divider" />
                {renderMonth(nextMonth)}
            </div>
            <div className="calendar-footer">
                <div className="flexible-options">
                    <button className="flex-chip active">Exact dates</button>
                    <button className="flex-chip">± 1 day</button>
                    <button className="flex-chip">± 2 days</button>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return createPortal(
            <div className="mobile-portal-overlay" style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {popupContent}
            </div>,
            document.body
        );
    }

    return popupContent;
};

/**
 * Guest Selector with Airbnb-style counters and interdependent logic.
 */
export const GuestPopup = ({ guests, onChange, onClose }) => {
    const [isMobile, setIsMobile] = useState(false);
    const popupRef = useRef(null);

    // Detect mobile for Portal usage
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, [onClose]);

    const handleUpdate = (type, delta) => {
        const newVal = Math.max(0, (guests[type] || 0) + delta);
        const updated = { ...guests, [type]: newVal };

        // Mandatory 1 adult if kids/infants are present
        if ((updated.children > 0 || updated.infants > 0) && updated.adults === 0) {
            updated.adults = 1;
        }

        onChange(updated);
    };

    const guestTypes = [
        { id: 'adults', label: 'Adults', sub: 'Ages 13 or above' },
        { id: 'children', label: 'Children', sub: 'Ages 2–12' },
        { id: 'infants', label: 'Infants', sub: 'Under 2' },
        { id: 'pets', label: 'Pets', sub: 'Service animals welcome' },
    ];

    const popupContent = (
        <div
            className="guest-popup"
            ref={popupRef}
            onClick={(e) => e.stopPropagation()}
        >
            {guestTypes.map(({ id, label, sub }) => (
                <div key={id} className="guest-row">
                    <div className="guest-info">
                        <div className="guest-label">{label}</div>
                        <div className="guest-sub">{sub}</div>
                    </div>
                    <div className="guest-controls">
                        <button
                            className="counter-btn"
                            disabled={guests[id] === 0 || (id === 'adults' && guests.adults === 1 && (guests.children > 0 || guests.infants > 0))}
                            onClick={() => handleUpdate(id, -1)}
                        >
                            <FaMinus />
                        </button>
                        <span className="guest-count">{guests[id] || 0}</span>
                        <button
                            className="counter-btn"
                            onClick={() => handleUpdate(id, 1)}
                        >
                            <FaPlus />
                        </button>
                    </div>
                </div>
            ))}
            <div className="popup-footer">
                <button className="done-btn" onClick={onClose}>Done</button>
            </div>
        </div>
    );

    if (isMobile) {
        return createPortal(
            <div className="mobile-portal-overlay" style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {popupContent}
            </div>,
            document.body
        );
    }

    return popupContent;
};
