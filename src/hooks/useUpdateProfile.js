import { useState } from 'react';
import userApi from '../api/userApi';

/**
 * Hook to handle profile and password updates.
 * Manages loading, success, and error states.
 */
export const useUpdateProfile = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const resetStates = () => {
        setError(null);
        setSuccess(false);
    };

    const updateName = async (newName) => {
        setIsSaving(true);
        resetStates();
        try {
            await userApi.changeUsername(newName);
            sessionStorage.setItem('username', JSON.stringify(newName));
            setSuccess(true);
            return true;
        } catch (err) {
            setError(err || 'Failed to update username');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const updatePassword = async (oldPassword, newPassword) => {
        setIsSaving(true);
        resetStates();
        try {
            await userApi.changePassword({ oldPassword, newPassword });
            setSuccess(true);
            return true;
        } catch (err) {
            setError(err || 'Failed to update password');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isSaving,
        error,
        success,
        updateName,
        updatePassword,
        resetStates
    };
};

export default useUpdateProfile;
