import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginWithFacebook } from '../api/authApi';
import websocketService from '../socket/websocketService';
import '../styles/auth.css';

const FacebookCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      console.log('Facebook callback already processed, skipping...');
      return;
    }

    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      let code = searchParams.get('code');
      let state = searchParams.get('state');

      // Facebook sometimes appends #_=_ to the callback URL
      if (code && code.endsWith('#_=_')) code = code.replace('#_=_', '');
      if (state && state.endsWith('#_=_')) state = state.replace('#_=_', '');
      // Also check window.location.hash
      if (window.location.hash === '#_=_') {
        window.history.replaceState('', document.title, window.location.pathname + window.location.search);
      }

      if (!code) {
        setError('No authorization code received from Facebook.');
        setLoading(false);
        return;
      }

      const storedState = sessionStorage.getItem('facebook_oauth_state');
      if (state !== storedState) {
        setError('Security error: CSRF state mismatch. Please try logging in again.');
        setLoading(false);
        return;
      }

      hasProcessed.current = true;

      console.log('Facebook Authorization Code received:', code);

      try {
        console.log('Exchanging Facebook authentication code for JWT...');
        const redirectUri = `${window.location.origin}/facebook/callback`;
        const response = await loginWithFacebook(code, redirectUri);

        console.log("Facebook Login response:", response);

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
        console.error('Facebook Login Error:', err);
        setError(err?.message || 'Failed to authenticate with Facebook. Please try again.');

      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1>Authenticating...</h1>
          <div className="alert-info">Please wait while we complete your Facebook sign-in.</div>
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

export default FacebookCallback;