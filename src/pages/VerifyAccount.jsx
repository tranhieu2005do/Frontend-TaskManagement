import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyAccount } from '../api/authApi';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import '../styles/auth.css';

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const hasCalled = useRef(false);

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        const response = await verifyAccount(token);
        setStatus('success');
        setMessage(response.message || 'Your account has been successfully verified!');

        // Auto redirect after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } catch (err) {
        setStatus('error');
        setMessage(err?.message || 'Verification failed. The link may be expired or invalid.');
      }
    };

    performVerification();
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        {status === 'loading' && (
          <div className="verify-state">
            <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
            <h1>Verifying Account</h1>
            <p className="auth-subtitle">Please wait while we activate your account...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-state">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h1>Verification Successful!</h1>
            <p className="auth-subtitle mb-6">{message}</p>
            <p className="text-sm text-gray-400 mb-6">
              You will be redirected to the login page automatically in a few seconds.
            </p>
            <Link to="/login" className="btn btn-primary w-full flex items-center justify-center gap-2">
              Go to Login <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-state">
            <XCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h1>Verification Failed</h1>
            <p className="auth-subtitle mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn btn-primary w-full">
                Back to Login
              </Link>
              <p className="text-sm text-gray-400">
                If the token expired, try logging in to resend the verification email.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
