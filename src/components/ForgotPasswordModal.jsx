import React, { useState, useEffect, useRef } from 'react';
import { forgotPassword, verifyOtp, resetPassword } from '../api/authApi';
import InputField from './InputField';
import { X, Eye, EyeOff, CheckCircle, ArrowRight, RefreshCw, Lock, Mail, ShieldCheck } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return setError('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Invalid email format');

    setLoading(true);
    setError('');
    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res.message || 'OTP has been sent to your email');
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return setError('OTP is required');

    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(email, otp);
      setResetToken(res.data.reset_token);
      setSuccessMsg(res.message || 'OTP verified successfully');
      setStep(3);
    } catch (err) {
      setError(err?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    setError('');
    try {
      const res = await resetPassword(email, resetToken, newPassword);
      setSuccessMsg(res.message || 'Password reset successful!');
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    onClose();
    setTimeout(() => {
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccessMsg('');
    }, 300);
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>
          <X size={18} />
        </button>

        <div className="modal-header">
          <h2>{step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'New Password'}</h2>
          <p>
            {step === 1 && "Confirm your email and we'll send you a verification code."}
            {step === 2 && `Enter the 6-digit code sent to ${email}.`}
            {step === 3 && "Secure your account with a strong new password."}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <ShieldCheck size={18} />
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="success-banner">
            <CheckCircle size={18} />
            {successMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <InputField
              label="Email Address"
              type="email"
              placeholder="e.g. alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Send Reset Link'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <InputField
              label="Verification Code"
              type="text"
              placeholder="000 000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              icon={ShieldCheck}
              required
            />
            <div className="otp-timer-container">
              <span>Time remaining</span>
              {countdown > 0 ? (
                <span style={{ fontWeight: 600, color: '#ef4444' }}>{countdown}s</span>
              ) : (
                <button
                  type="button"
                  className="resend-button"
                  onClick={() => handleRequestOtp()}
                  disabled={loading}
                >
                  <RefreshCw size={14} style={{ marginRight: '4px' }} />
                  Resend Code
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '24px' }}>
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="input-group">
              <label className="label">New Password</label>
              <div className="input-with-icon">
                <div className="input-icon-left">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input ${error ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="label">Confirm New Password</label>
              <div className="input-with-icon">
                <div className="input-icon-left">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input ${error ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '24px' }}>
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
