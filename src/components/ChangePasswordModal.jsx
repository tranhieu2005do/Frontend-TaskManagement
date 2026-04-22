import React, { useState } from 'react';
import '../styles/modal.css';
import { changePassword } from '../api/userApi';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const validatePassword = (password) => {
    const list = [];
    if (password.length < 8) list.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) list.push('Include uppercase letter');
    if (!/[a-z]/.test(password)) list.push('Include lowercase letter');
    if (!/[0-9]/.test(password)) list.push('Include number');
    return list;
  };

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.currentPassword.trim()) newErrors.currentPassword = 'Current password is required';

    const pErrors = validatePassword(formData.newPassword);
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (pErrors.length) {
      newErrors.newPassword = pErrors.join(', ');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        old_password: formData.currentPassword,
        new_password: formData.newPassword,
      });
      setSuccess('Password changed successfully.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setErrors({ api: error?.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  const requirements = validatePassword(formData.newPassword);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔑 Change Password</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password *</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              placeholder="Enter your current password"
              className={errors.currentPassword ? 'error' : ''}
            />
            {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
          </div>
          <div className="form-group">
            <label>New Password *</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              placeholder="Enter your new password"
              className={errors.newPassword ? 'error' : ''}
            />
            <div className="password-requirements">
              <div>• At least 8 characters</div>
              <div>• Include uppercase & lowercase</div>
              <div>• Include numbers</div>
            </div>
            {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
          </div>
          <div className="form-group">
            <label>Confirm New Password *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Confirm your new password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>
          {errors.api && <div className="error-banner">{errors.api}</div>}
          {success && <div className="success-banner">{success}</div>}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
