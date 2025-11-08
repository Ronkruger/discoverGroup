import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Calendar, Users, Sparkles, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-pink-400 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Icons */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 text-purple-400 opacity-20"
      >
        <MapPin size={48} />
      </motion.div>
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -10, 10, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 right-20 text-pink-400 opacity-20"
      >
        <Sparkles size={40} />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          {registrationComplete ? (
            /* Success State */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle2 className="mx-auto text-white mb-3" size={64} />
                </motion.div>
                <h2 className="text-3xl font-bold text-white">Registration Successful!</h2>
              </div>
              
              <div className="px-8 py-10 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-6"
                >
                  <p className="text-gray-700 mb-2 text-lg">{success}</p>
                  <p className="text-sm text-gray-600 mt-3">
                    We've sent a verification email to{' '}
                    <span className="font-semibold text-green-700">{form.email}</span>
                  </p>
                </motion.div>
                
                <div className="space-y-4 mb-8">
                  {[
                    { icon: '📧', text: 'Check your inbox (and spam folder)' },
                    { icon: '🔗', text: 'Click the verification link in the email' },
                    { icon: '✅', text: 'Then you can login to your account' }
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-center gap-3 text-gray-700"
                    >
                      <span className="text-2xl">{step.icon}</span>
                      <span>{step.text}</span>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Go to Login
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* Registration Form */
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Header with Gradient */}
              <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-8 py-10 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4"
                >
                  <Users className="text-white" size={32} />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  Create Account
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-purple-100"
                >
                  Start your adventure today
                </motion.p>
              </div>

              {/* Form Content */}
              <div className="px-8 py-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                  >
                    <p className="text-red-700 text-sm">{error}</p>
                  </motion.div>
                )}
                {success && !registrationComplete && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg"
                  >
                    <p className="text-green-700 text-sm">{success}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative group">
                        <motion.div
                          animate={focusedField === 'fullName' ? { scale: 1 } : { scale: 0.95 }}
                          className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"
                        />
                        <div className="relative flex items-center">
                          <User className="absolute left-4 text-gray-400 group-hover:text-purple-600 transition-colors" size={20} />
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="text"
                            name="fullName"
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
                            placeholder="John Doe"
                            value={form.fullName}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('fullName')}
                            onBlur={() => setFocusedField(null)}
                            required
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative group">
                        <motion.div
                          animate={focusedField === 'email' ? { scale: 1 } : { scale: 0.95 }}
                          className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"
                        />
                        <div className="relative flex items-center">
                          <Mail className="absolute left-4 text-gray-400 group-hover:text-pink-600 transition-colors" size={20} />
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="email"
                            name="email"
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all duration-300"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Phone */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <motion.div
                          animate={focusedField === 'phone' ? { scale: 1 } : { scale: 0.95 }}
                          className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"
                        />
                        <div className="relative flex items-center">
                          <Phone className="absolute left-4 text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="tel"
                            name="phone"
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                            placeholder="+63 912 345 6789"
                            value={form.phone}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            required
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Birth Date */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Birth Date
                      </label>
                      <div className="relative group">
                        <motion.div
                          animate={focusedField === 'birthDate' ? { scale: 1 } : { scale: 0.95 }}
                          className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"
                        />
                        <div className="relative flex items-center">
                          <Calendar className="absolute left-4 text-gray-400 group-hover:text-purple-600 transition-colors" size={20} />
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="date"
                            name="birthDate"
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
                            value={form.birthDate}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('birthDate')}
                            onBlur={() => setFocusedField(null)}
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Gender */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="relative group">
                      <motion.div
                        animate={focusedField === 'gender' ? { scale: 1 } : { scale: 0.95 }}
                        className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"
                      />
                      <div className="relative flex items-center">
                        <Users className="absolute left-4 text-gray-400 group-hover:text-pink-600 transition-colors" size={20} />
                        <motion.select
                          whileFocus={{ scale: 1.01 }}
                          name="gender"
                          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all duration-300 appearance-none cursor-pointer"
                          value={form.gender}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('gender')}
                          onBlur={() => setFocusedField(null)}
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </motion.select>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Password */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative group">
                        <motion.div
                          animate={focusedField === 'password' ? { scale: 1 } : { scale: 0.95 }}
                          className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"
                        />
                        <div className="relative flex items-center">
                          <Lock className="absolute left-4 text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            required
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            className="absolute right-4 text-gray-400 hover:text-blue-600 transition-colors"
                            onClick={() => setShowPassword(s => !s)}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <motion.div
                          animate={focusedField === 'confirmPassword' ? { scale: 1 } : { scale: 0.95 }}
                          className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"
                        />
                        <div className="relative flex items-center">
                          <Lock className="absolute left-4 text-gray-400 group-hover:text-purple-600 transition-colors" size={20} />
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type={showConfirm ? "text" : "password"}
                            name="confirmPassword"
                            className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => setFocusedField(null)}
                            required
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            className="absolute right-4 text-gray-400 hover:text-purple-600 transition-colors"
                            onClick={() => setShowConfirm(s => !s)}
                          >
                            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="group relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-6"
                  >
                    <motion.div
                      animate={{ x: loading ? [0, 300] : 0 }}
                      transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>

                {/* Login Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-6 text-center"
                >
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-blue-600 transition-all duration-300"
                    >
                      Login Here
                    </Link>
                  </p>
                </motion.div>
              </div>
            </div>
          )}

          {/* Bottom Decorative Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8 text-gray-500 text-sm"
          >
            Join thousands of travelers exploring the world 🌍
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
