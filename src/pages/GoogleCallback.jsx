import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginWithGoogle } from '../api/authApi';
import websocketService from '../socket/websocketService';
import '../styles/auth.css';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      console.log('Already processed, skipping...');
      return;
    }

    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      if (!code) {
        setError('No authorization code received from Google.');
        setLoading(false);
        return;
      }

      hasProcessed.current = true;

      console.log('Google Authorization Code received:', code);
      try {
        console.log('Exchanging authentication code for JWT...');
        const redirectUri = `${window.location.origin}/oauth2/callback/google`;
        const response = await loginWithGoogle(code, redirectUri);

        console.log("Google Login response:", response);

        if (response.data) {
          sessionStorage.setItem('email', response.data.email);
          sessionStorage.setItem('authToken', response.data.access_token);
          sessionStorage.setItem('username', response.data.user_name);
          sessionStorage.setItem('user_id', response.data.user_id);

          websocketService.connect(response.data.access_token);
          navigate('/dashboard');
        } else {
          throw new Error('Invalid response from server.');
        }
      } catch (err) {
        console.error('Google Login Error:', err);
        setError(err?.message || 'Failed to authenticate with Google. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate]); // Keep dependencies

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1>Authenticating...</h1>
          <div className="alert-info">Please wait while we complete your Google sign-in.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1>Authentication Failed</h1>
          <div className="alert alert-error">{error}</div>
          <p className="auth-link">
            <a href="/login">Back to Login</a>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;