import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import InputField from '../components/InputField';
import { login } from '../api/authApi';
import websocketService from '../socket/websocketService';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { Mail, Lock, LogIn } from 'lucide-react';
import '../styles/auth.css';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { addToast } = useToast();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      addToast(location.state.message, 'success');
    }

    // Check for verification status from backend redirect
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('verified') === 'true') {
      addToast('Account verified successfully! You can now login.', 'success');
      // Replace URL to clean up parameters
      navigate(location.pathname, { replace: true });
    } else if (queryParams.get('error') === 'verification_failed') {
      addToast('Verification failed. The link might be expired.', 'error');
      navigate(location.pathname, { replace: true });
    }
  }, [location, addToast, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    console.log(formData);

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login response:", response);

      // Store token
      if (response.data) {
        sessionStorage.setItem('email', response.data.email)
        sessionStorage.setItem('authToken', response.data.access_token);
        sessionStorage.setItem('username', response.data.user_name);
        sessionStorage.setItem('user_id', response.data.user_id)

        // Connect WebSocket
        websocketService.connect(response.data.access_token);
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setApiError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Please enter your details to sign in.</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com"
            error={errors.email}
            icon={Mail}
            required
          />

          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
            icon={Lock}
            required
          />

          <div className="otp-timer-container" style={{ marginTop: '-12px' }}>
            <div />
            <button
              type="button"
              className="resend-button"
              onClick={() => setIsForgotPasswordOpen(true)}
            >
              Forgot Password (Click) ?
            </button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <LogIn size={18} />}
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <button
          className="btn btn-social"
          type="button"
          onClick={() => {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Replace with actual Client ID
            const redirectUri = `${window.location.origin}/oauth2/callback/google`;
            const scope = 'openid email profile';
            const responseType = 'code';
            const accessType = 'offline';
            const prompt = 'consent';

            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;

            window.location.href = googleAuthUrl;
          }}
          disabled={loading}
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google Logo" />
          Continue with Google
        </button>

        <button
          className="btn btn-social"
          type="button"
          onClick={() => {
            const state = crypto.randomUUID();
            sessionStorage.setItem('facebook_oauth_state', state);

            const clientId = '1564939631244331';
            const redirectUri = `${window.location.origin}/facebook/callback`;
            const scope = 'email,public_profile';

            const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

            window.location.href = facebookAuthUrl;
          }}
          disabled={loading}
        >
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="facebook" width="24" />
          Continue with Facebook
        </button>

        <p className="auth-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;
