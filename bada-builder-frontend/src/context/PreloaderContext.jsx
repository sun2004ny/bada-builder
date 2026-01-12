import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

const PreloaderContext = createContext();

export const usePreloader = () => useContext(PreloaderContext);

export const PreloaderProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [activeIcon, setActiveIcon] = useState(null);
    const [activeText, setActiveText] = useState('');
    const navigate = useNavigate();

    const triggerPreloader = (target, icon, text) => {
        setActiveIcon(icon);
        setActiveText(text);
        setLoading(true);

        // Wait for fade-in
        setTimeout(() => {
            // Check if target is a path (string) or a callback function
            if (typeof target === 'string') {
                navigate(target);
            } else if (typeof target === 'function') {
                target();
            }

            // Keep loading true for a short moment after action to allow fade out
            setTimeout(() => {
                setLoading(false);
                // Clear icon and text after animation finishes
                setTimeout(() => {
                    setActiveIcon(null);
                    setActiveText('');
                }, 300);
            }, 300); // Main delay before hiding
        }, 400); // 400ms delay for the preloader to show up and stabilize
    };

    // Global Search Detection
    useEffect(() => {
        const handleGlobalSubmit = (e) => {
            const form = e.target;
            if (!form || form.tagName !== 'FORM') return;

            // Detect if this is a search form
            // Heuristics:
            // 1. Input type="search"
            // 2. Class name contains "search"
            // 3. Input name/id contains "search"
            // 4. Input placeholder contains "Search"
            const hasSearchInput = Array.from(form.elements).some(input => {
                if (input.tagName !== 'INPUT') return false;
                const type = input.getAttribute('type')?.toLowerCase();
                const name = input.getAttribute('name')?.toLowerCase();
                const id = input.getAttribute('id')?.toLowerCase();
                const placeholder = input.getAttribute('placeholder')?.toLowerCase();
                const className = input.getAttribute('class')?.toLowerCase();

                return (
                    type === 'search' ||
                    name?.includes('search') ||
                    name?.includes('q') ||
                    id?.includes('search') ||
                    placeholder?.includes('search') ||
                    className?.includes('search')
                );
            });

            const formClassMatches = form.className?.toLowerCase().includes('search');

            if (hasSearchInput || formClassMatches) {
                // It's a search form!
                // We only show visual feedback here, we do NOT prevent default or hijack logic.
                // The standard React handlers will still run immediately.

                // Import FiSearch dynamically or assume generic search icon available in context scope if needed?
                // Since we are in Context, we can't easily use inline JSX from outside unless imported.
                // We'll trust the Context to be able to render the icon if passed, or we modify activeIcon state to accept generic node.

                // IMPORTANT: We need an icon. The context implementation uses specific imports usually.
                // We'll assume PreloaderContext file has generic access or we pass a simple object.
                // Since `activeIcon` expects a React node, we need to make sure we can provide one.
                // For now, we will use a text indicator primarily or import the icon here if not present.

                // Let's create a visual "Searching..." state immediately
                setActiveText("Searching...");
                setActiveIcon(<FiSearch />);
                setLoading(true);
                // Setting an icon might require importing FiSearch here. 
                // We'll skip the icon for global auto-detect or import it at top of file.
                // Actually, let's fix imports in next step if generic icon is missing.

                // Auto-hide after a "smooth" duration (matches transition timings)
                // 500ms allows for operation + transition
                setTimeout(() => {
                    setLoading(false);
                    setTimeout(() => {
                        setActiveText('');
                        setActiveIcon(null);
                    }, 300);
                }, 800);
            }
        };

        window.addEventListener('submit', handleGlobalSubmit);
        return () => {
            window.removeEventListener('submit', handleGlobalSubmit);
        };
    }, []);

    return (
        <PreloaderContext.Provider value={{ loading, activeIcon, activeText, triggerPreloader }}>
            {children}
        </PreloaderContext.Provider>
    );
};
