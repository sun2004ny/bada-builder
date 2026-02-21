import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { usePreloader } from '../../context/PreloaderContext';
import logo from '../../assets/logo.png';
import './InitialPreloader.css';

const InitialPreloader = () => {
    const { initialLoading, setInitialLoading } = usePreloader();
    const [shouldRender, setShouldRender] = useState(true);
    const containerRef = useRef();
    const logoRef = useRef();
    const glowRef = useRef();

    useEffect(() => {
        if (!shouldRender) return;

        // Ensure body is not scrollable during preloader
        document.body.style.overflow = 'hidden';

        const tl = gsap.timeline({
            defaults: { ease: "expo.out" },
            onComplete: () => {
                // Final reveal of the website
                const revealTl = gsap.timeline({
                    onComplete: () => {
                        setInitialLoading(false);
                        document.body.style.overflow = '';
                        // Wait a bit before unmounting to ensure fade out is visually complete
                        setTimeout(() => setShouldRender(false), 500);
                        // Trigger custom event for other components to know transition is done
                        window.dispatchEvent(new CustomEvent('initial-preloader-done'));
                    }
                });

                revealTl.to(containerRef.current, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                });

                // Fade in header items
                gsap.to('.nav-link, .header-login-btn, .mobile-header-tools', {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    stagger: 0.08,
                    ease: "power3.out"
                });
            }
        });

        // Initial positions
        gsap.set(logoRef.current, {
            x: -150,
            opacity: 0,
            scale: 0.8,
            filter: 'drop-shadow(0 0 0px rgba(88, 51, 94, 0))'
        });
        gsap.set(glowRef.current, {
            opacity: 0,
            scale: 0.5
        });

        // 1. Smooth entrance from left
        tl.to(logoRef.current, {
            x: 0,
            opacity: 1,
            duration: 1.0,
            ease: "power4.out"
        });

        // 2. Cinematic zoom and glow
        tl.to(logoRef.current, {
            scale: 1.1,
            filter: 'drop-shadow(0 0 25px rgba(88, 51, 94, 0.4))',
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.3");

        tl.to(glowRef.current, {
            opacity: 0.4,
            scale: 1.8,
            duration: 1.0,
            ease: "power2.out"
        }, "-=0.8");

        // 3. Short center pause
        tl.to({}, { duration: 0.2 });

        // 4. Transform to header position
        tl.to(logoRef.current, {
            onStart: () => {
                const headerLogo = document.getElementById('header-logo-link');
                if (headerLogo) {
                    const rect = headerLogo.getBoundingClientRect();
                    const logoRect = logoRef.current.getBoundingClientRect();

                    // Calculate center positions
                    const windowCenterX = window.innerWidth / 2;
                    const windowCenterY = window.innerHeight / 2;

                    const targetCenterX = rect.left + rect.width / 2;
                    const targetCenterY = rect.top + rect.height / 2;

                    const deltaX = targetCenterX - windowCenterX;
                    const deltaY = targetCenterY - windowCenterY;

                    // Scale factor based on height to preserve aspect ratio
                    const targetScale = rect.height / (logoRect.height / 1.1); // Divide by current scale

                    gsap.to(logoRef.current, {
                        x: deltaX,
                        y: deltaY,
                        scale: targetScale,
                        duration: 1.0,
                        ease: "expo.inOut"
                    });

                    gsap.to(glowRef.current, {
                        opacity: 0,
                        scale: 0.2,
                        duration: 0.6,
                        ease: "power2.in"
                    });
                } else {
                    // Fallback move to top-left
                    gsap.to(logoRef.current, {
                        x: -window.innerWidth / 2 + 100,
                        y: -window.innerHeight / 2 + 50,
                        scale: 0.4,
                        opacity: 0,
                        duration: 0.8,
                        ease: "power4.inOut"
                    });
                }
            },
            duration: 1.0
        });

        return () => {
            tl.kill();
            document.body.style.overflow = '';
        };
    }, [initialLoading, setInitialLoading]);

    if (!shouldRender) return null;

    return (
        <div className="initial-preloader" ref={containerRef}>
            <div className="preloader-overlay-bg"></div>
            <div className="glow-effect" ref={glowRef}></div>
            <div className="preloader-logo-wrapper">
                <img src={logo} alt="BADABUILDER" ref={logoRef} className="preloader-logo" />
            </div>
        </div>
    );
};

export default InitialPreloader;
