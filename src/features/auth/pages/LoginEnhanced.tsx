import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const LoginEnhanced = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
  const [touched, setTouched] = useState<{email?: boolean; password?: boolean}>({});

  // Redirect when login successful
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }

    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailErrors: {email?: string} = {};
    const passwordErrors: {password?: string} = {};
    
    if (!formData.email) {
      emailErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      emailErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      passwordErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      passwordErrors.password = 'Password must be at least 6 characters';
    }

    setTouched({ email: true, password: true });
    setErrors({ ...emailErrors, ...passwordErrors });

    // Check if there are validation errors
    if (Object.keys(emailErrors).length > 0 || Object.keys(passwordErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      await login(formData.email, formData.password);
      // Success - user will be redirected by useEffect
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Parse error response
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 401) {
          // Unauthorized - wrong email or password
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (status === 400) {
          // Bad request - validation error
          errorMessage = data?.message || 'Please check your email and password format.';
        } else if (status === 404) {
          // Not found - user doesn't exist
          errorMessage = 'No account found with this email address.';
        } else if (status >= 500) {
          // Server error
          errorMessage = 'Server error. Please try again later.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrors({
        general: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Form is valid if email and password are filled and have valid format
  const isFormValid = formData.email && 
                     formData.password && 
                     formData.password.length >= 6 &&
                     /\S+@\S+\.\S+/.test(formData.email) &&
                     !isLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 to-lime-400 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-sky-400 to-lime-400 p-8 text-center">
            <div className="inline-block p-4 bg-white rounded-full mb-4 shadow-lg">
              <Dumbbell className="w-8 h-8 text-sky-500" />
            </div>
            <h1 className="text-3xl text-white mb-2 font-bold">Welcome Back!</h1>
            <p className="text-sky-50">Sign in to continue your fitness journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* General Error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.general}
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200 outline-none ${
                    errors.email && touched.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : touched.email && !errors.email
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                      : 'border-gray-300 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {touched.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors.email ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : formData.email ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg transition-all duration-200 outline-none ${
                    errors.password && touched.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : touched.password && !errors.password
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                      : 'border-gray-300 focus:ring-sky-500 focus:border-sky-500'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                !isLoading && isFormValid
                  ? 'bg-gradient-to-r from-sky-400 to-lime-400 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                  : isLoading
                  ? 'bg-gray-400 text-white cursor-wait'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500">Don't have an account?</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            <Link
              to="/register"
              className="inline-block w-full py-3 px-4 border-2 border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition-colors font-medium"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
