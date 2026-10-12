import React, { useState, useEffect } from 'react';
import { GraduationCap, User, Shield, Eye, EyeOff, Mail, Lock, UserPlus } from 'lucide-react';
import { UserRole } from '../../types';
import { studentService } from '../../services/studentService';
import { Student } from '../../types';

interface LoginPageProps {
  onLogin: (role: UserRole, userId?: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load students when component mounts
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const studentsData = await studentService.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      // Don't show error to user, just log it
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Demo credentials
      const demoEmail = 'admin@example.com';
      const demoPassword = 'admin123';

      if (isLogin) {
        if (email === demoEmail && password === demoPassword) {
          onLogin('admin');
        } else {
          throw new Error('Invalid admin credentials. Use admin@example.com / admin123');
        }
      } else {
        // In demo mode, simulate successful registration
        setSuccess('Demo: Registration successful! You can now login.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setDisplayName('');
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Note: Student login via credentials is disabled in demo.
  // Admin can access any student from the selector below.

  const handleAdminAccessStudent = () => {
    if (!selectedStudentId) {
      setError('Please select a student');
      return;
    }
    onLogin('student', selectedStudentId);
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Demo: simulate reset
      await new Promise(r => setTimeout(r, 800));
      setSuccess('Demo: Password reset link simulated.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    // Demo: simulate verification resend
    setSuccess('Demo: Verification email simulated.');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url("https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-indigo-900/30"></div>
      
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
              <img 
                src="/cognigrade.png" 
                alt="Cognigrade Education" 
                className="h-16 w-16 rounded-full object-cover border-2 border-white/50"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <GraduationCap className="h-12 w-12 text-white hidden" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Cognigrade Zone</h1>
          <p className="text-white/90 text-lg drop-shadow">Advanced Student Management System</p>
        </div>

        {/* Role Selection */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 relative z-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Welcome Back</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex flex-col items-center p-5 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === 'admin'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-blue-300 text-gray-600 hover:shadow-md'
                }`}
              >
                <Shield className="h-8 w-8 mb-2" />
                <span className="font-medium">Admin</span>
                <span className="text-xs text-center mt-1">Manage students & analytics</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex flex-col items-center p-5 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === 'student'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-blue-300 text-gray-600 hover:shadow-md'
                }`}
              >
                <User className="h-8 w-8 mb-2" />
                <span className="font-medium">Student</span>
                <span className="text-xs text-center mt-1">Track progress & exams</span>
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
              {error.includes('email already exists') && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setError('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Switch to Login instead
                  </button>
                </div>
              )}
              {error.includes('operation-not-allowed') && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">To fix this issue:</p>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                    <li>Select your project: "studentsdata-007"</li>
                    <li>Go to Authentication → Sign-in method</li>
                    <li>Enable "Email/Password" authentication</li>
                    <li>Save changes and try again</li>
                  </ol>
                </div>
              )}
              {error.includes('verify your email') && (
                <button
                  onClick={resendVerification}
                  className="text-sm text-red-600 underline mt-1"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50/90 backdrop-blur-sm border border-green-200 rounded-xl">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="mb-4 p-4 bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-xl">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Reset Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/90"
                  placeholder="Enter your email address"
                  required
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-xl text-sm font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {selectedRole === 'admin' ? (
            <>
              {/* Admin Auth Toggle */}
              <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isLogin
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !isLogin
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAdminAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <UserPlus className="inline h-4 w-4 mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/90"
                    placeholder="admin@shreejieducation.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline h-4 w-4 mr-1" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/90"
                      placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Login as Admin' : 'Register as Admin')}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Student Portal Access
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Student to Access
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm"
                      disabled={loadingStudents}
                    >
                      <option value="">
                        {loadingStudents ? 'Loading students...' : 'Choose a student'}
                      </option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.school} (Grade {student.grade})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAdminAccessStudent}
                    disabled={!selectedStudentId || loadingStudents}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg"
                  >
                    🚀 Access Student Dashboard
                  </button>
                </div>
                <div className="mt-4 p-3 bg-white/70 rounded-lg">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>✅ Select any student to view their dashboard</p>
                    <p>✅ No authentication required for admin access</p>
                    <p>✅ {students.length} students available</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/30">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Authentication Info:
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> Register with your email to access admin panel</p>
              <p><strong>Student:</strong> Use your assigned email and password</p>
              <p><strong>Security:</strong> All data is protected by Firebase security rules</p>
              <p><strong>Password Reset:</strong> Use "Forgot Password" if needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}