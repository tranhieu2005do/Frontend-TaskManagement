import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../components/InputField';
import { register } from '../api/authApi';
import { User, Mail, Lock, UserPlus, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    mail: '',
    password: '',
    confirm_pass: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mail.trim()) {
      newErrors.mail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
      newErrors.mail = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirm_pass) {
      newErrors.confirm_pass = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.fullName,
        mail: formData.mail,
        password: formData.password,
        confirm_pass: formData.confirm_pass,
      });

      setIsSuccess(true);
      addToast('Registration successful! Please check your email.', 'success');
    } catch (err) {
      const errorMessage = err?.message || 'Registration failed. Please try again.';
      setApiError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
          <h1>Registration Successful!</h1>
          <p className="auth-subtitle mb-8">
            We've sent a verification email to <strong>{formData.mail}</strong>.<br />
            Please check your inbox and click the link to activate your account.
          </p>
          <button
            onClick={() => navigate('/login', { state: { message: 'Please login after verifying your email.' } })}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            Go to Login <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join us and start managing your tasks.</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            error={errors.fullName}
            icon={User}
            required
          />

          <InputField
            label="Email"
            type="email"
            name="mail"
            value={formData.mail}
            onChange={handleChange}
            placeholder="name@company.com"
            error={errors.mail}
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

          <InputField
            label="Confirm Password"
            type="password"
            name="confirm_pass"
            value={formData.confirm_pass}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.confirm_pass}
            icon={Lock}
            required
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
            {!loading && <UserPlus size={18} />}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
