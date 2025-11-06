import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    birthDate: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const navigate = useNavigate();
  const { setUser, user } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
          birthDate: form.birthDate,
          gender: form.gender,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      // Show success message and verification instructions
      if (data.requiresVerification) {
        setSuccess(data.message || 'Registration successful! Please check your email to verify your account.');
        setRegistrationComplete(true);
      } else {
        // Old flow (shouldn't happen with new backend)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Client Registration</h2>
      
      {registrationComplete ? (
        <div className="text-center py-8">
          <div className="mb-6 text-green-600 text-6xl">✉️</div>
          <h3 className="text-xl font-bold mb-4 text-green-600">Registration Successful!</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 mb-2">{success}</p>
            <p className="text-sm text-gray-600">
              We've sent a verification email to <strong>{form.email}</strong>
            </p>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>📧 Check your inbox (and spam folder)</p>
            <p>🔗 Click the verification link in the email</p>
            <p>✅ Then you can login to your account</p>
          </div>
          <div className="mt-6">
            <Link 
              to="/login" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded">{error}</div>}
          {success && <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-600 rounded">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <input type="text" name="fullName" className="w-full border rounded px-3 py-2" value={form.fullName} onChange={handleChange} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" name="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input type="tel" name="phone" className="w-full border rounded px-3 py-2" value={form.phone} onChange={handleChange} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Birth Date</label>
          <input type="date" name="birthDate" className="w-full border rounded px-3 py-2" value={form.birthDate} onChange={handleChange} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Gender</label>
          <select name="gender" className="w-full border rounded px-3 py-2" value={form.gender} onChange={handleChange} required>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="w-full border rounded px-3 py-2 pr-10"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowPassword(s => !s)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              className="w-full border rounded px-3 py-2 pr-10"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowConfirm(s => !s)}
            >
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </div>
        </>
      )}
    </div>
  );
}
