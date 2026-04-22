import { useState, useEffect } from 'react';

/**
 * Hook to manage user profile state from sessionStorage.
 * Detects changes to sessionStorage and provides a synchronized user object.
 */
export const useProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = () => {
        try {
            const storedUser = {
                id: sessionStorage.getItem('user_id'),
                fullName: (sessionStorage.getItem('username') || '').replace(/"/g, ''),
                email: sessionStorage.getItem('email'),
                accountType: 'Premium Plan', // Mocked as per "Premium" request
                memberSince: 'March 2026'
            };

            if (storedUser.fullName || storedUser.email) {
                setUser(storedUser);
            }
        } catch (err) {
            console.error('Failed to load profile from sessionStorage', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();

        // Listen for local changes (e.g. from other components or tabs)
        const handleStorageChange = (e) => {
            if (['username', 'email'].includes(e.key)) {
                loadProfile();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return { user, loading, refresh: loadProfile };
};

export default useProfile;
