import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './BackgroundVideo.css';

/**
 * Reusable BackgroundVideo Component
 * 
 * Eliminates the flash/flicker before video loads by:
 * 1. Preloading video metadata
 * 2. Tracking video ready state
 * 3. Smooth fade-in transition when ready
 * 4. Proper fallback background color
 */
const BackgroundVideo = ({
    src,
    fallbackColor = '#1c0f2e',
    overlay = true,
    overlayOpacity = 0.35,
    className = '',
    children
}) => {
    const [isVideoReady, setIsVideoReady] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Handle video ready state
        const handleCanPlay = () => {
            setIsVideoReady(true);
        };

        // Handle video loaded data (earlier event)
        const handleLoadedData = () => {
            // Additional check to ensure video is truly ready
            if (video.readyState >= 3) {
                setIsVideoReady(true);
            }
        };

        // Add event listeners
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadeddata', handleLoadedData);

        // Check if video is already ready (cached)
        if (video.readyState >= 3) {
            setIsVideoReady(true);
        }

        // Cleanup
        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [src]);

    return (
        <>
            {/* Background Video */}
            <video
                ref={videoRef}
                className={`bg-video ${isVideoReady ? 'bg-video--ready' : ''} ${className}`}
                src={src}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                style={{
                    '--fallback-color': fallbackColor
                }}
            />

            {/* Optional Overlay for better text readability */}
            {overlay && (
                <div
                    className="bg-video-overlay"
                    style={{
                        '--overlay-opacity': overlayOpacity
                    }}
                />
            )}

            {/* Content passed as children */}
            {children}
        </>
    );
};

BackgroundVideo.propTypes = {
    src: PropTypes.string.isRequired,
    fallbackColor: PropTypes.string,
    overlay: PropTypes.bool,
    overlayOpacity: PropTypes.number,
    className: PropTypes.string,
    children: PropTypes.node
};

export default BackgroundVideo;
