import React, { useState } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  getMultiFactorResolver,
  TotpMultiFactorGenerator
} from 'firebase/auth';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { Mail, X, Shield, Smartphone } from 'lucide-react';
import { createUserProfile, updateLastLogin } from '../services/userService';

interface LoginPageProps {
  onNavigate?: (route: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [mfaVerificationId, setMfaVerificationId] = useState<string | null>(null);
  const [isVerifyingMFA, setIsVerifyingMFA] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const getErrorMessage = (errorCode: string): { title: string; message: string } => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return { title: 'User Not Found', message: 'No account found with this email address.' };
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return { title: 'Incorrect Password', message: 'The password you entered is incorrect.' };
      case 'auth/invalid-email':
        return { title: 'Invalid Email', message: 'Please enter a valid email address.' };
      case 'auth/user-disabled':
        return { title: 'Account Disabled', message: 'This account has been disabled.' };
      case 'auth/too-many-requests':
        return { title: 'Too Many Attempts', message: 'Too many failed login attempts. Try again later.' };
      case 'auth/network-request-failed':
        return { title: 'Network Error', message: 'Check your internet connection and try again.' };
      case 'auth/popup-closed-by-user':
        return { title: 'Login Cancelled', message: 'Login popup was closed.' };
      case 'auth/popup-blocked':
        return { title: 'Popup Blocked', message: 'Please allow popups to use social login.' };
      case 'auth/multi-factor-auth-required':
        return { title: '2FA Required', message: 'Please verify with your second factor.' };
      case 'auth/invalid-verification-code':
        return { title: 'Invalid Code', message: 'The verification code is incorrect.' };
      case 'auth/invalid-verification-id':
        return { title: 'Invalid Session', message: 'The verification session has expired. Please try again.' };
      case 'auth/account-exists-with-different-credential':
        return { title: 'Account Exists', message: 'An account already exists with this email using a different sign-in method.' };
      case 'auth/oauth-handler-domain-mismatch':
      case 'auth/unauthorized-domain':
        return { title: 'Configuration Error', message: 'GitHub OAuth is not properly configured. Please contact support.' };
      default:
        return { title: 'Login Failed', message: errorCode || 'An unexpected error occurred.' };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Missing Information', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Update user profile and last login in Firestore
      await createUserProfile(userCredential.user, 'email');
      await updateLastLogin(userCredential.user.uid);
      showSuccess('Login Successful', 'Welcome back!');
    } catch (err: any) {
      // Check if 2FA is required
      if (err.code === 'auth/multi-factor-auth-required') {
        try {
          const resolver = getMultiFactorResolver(auth, err);
          setMfaResolver(resolver);
          // Get the session from the first enrolled factor
          const hints = resolver.hints;
          if (hints.length > 0) {
            // For phone-based MFA, we need to initiate verification
            // For TOTP (authenticator app), the code is directly entered
            setShowMFA(true);
            showSuccess('2FA Required', 'Please enter the verification code from your authenticator app.');
          }
        } catch (resolverError: any) {
          showError('2FA Error', 'Failed to initialize 2FA verification. Please try again.');
        }
      } else {
        const { title, message } = getErrorMessage(err.code);
        showError(title, message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAVerification = async () => {
    if (!mfaCode || mfaCode.length !== 6) {
      showError('Invalid Code', 'Please enter a valid 6-digit verification code.');
      return;
    }

    if (!mfaResolver) {
      showError('Session Expired', 'The verification session has expired. Please try logging in again.');
      setShowMFA(false);
      return;
    }

    setIsVerifyingMFA(true);
    try {
      // Get the first enrolled factor (assuming TOTP authenticator app)
      const hints = mfaResolver.hints;
      if (hints.length === 0) {
        showError('No 2FA Method', 'No 2FA method is enrolled for this account.');
        setShowMFA(false);
        return;
      }

      // For TOTP (authenticator app), create assertion
      const factor = hints[0].factor;
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(factor.uid, mfaCode);
      
      // Resolve sign-in with the assertion
      const userCredential = await mfaResolver.resolveSignIn(assertion);
      
      // Update user profile and last login in Firestore
      if (userCredential.user) {
        await createUserProfile(userCredential.user, 'email');
        await updateLastLogin(userCredential.user.uid);
      }
      
      showSuccess('Login Successful', 'Welcome back!');
      setShowMFA(false);
      setMfaCode('');
      setMfaResolver(null);
    } catch (err: any) {
      const { title, message } = getErrorMessage(err.code);
      showError(title, message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifyingMFA(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      showError('Missing Email', 'Please enter your email address.');
      return;
    }

    setIsSendingReset(true);
    const auth = getAuth();
    try {
      // Configure action code settings for better email delivery
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, resetEmail, actionCodeSettings);
      setEmailSent(true);
      showSuccess('Email Sent', 'Password reset link has been sent to your email. Please check your inbox and spam folder.');
      // Keep modal open to show instructions
    } catch (err: any) {
      const { title, message } = getErrorMessage(err.code);
      showError(title, message);
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Create or update user profile in Firestore
      await createUserProfile(result.user, 'google');
      await updateLastLogin(result.user.uid);
      showSuccess('Login Successful', 'Logged in with Google.');
    } catch (err: any) {
      const { title, message } = getErrorMessage(err.code);
      showError(title, message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    const auth = getAuth();
    const provider = new GithubAuthProvider();
    // Add proper scopes for GitHub OAuth
    provider.addScope('read:user');
    provider.addScope('user:email');
    
    // Set custom parameters for better compatibility
    provider.setCustomParameters({
      allow_signup: 'true'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      // Create or update user profile in Firestore
      await createUserProfile(result.user, 'github');
      await updateLastLogin(result.user.uid);
      showSuccess('Login Successful', 'Logged in with GitHub.');
    } catch (err: any) {
      // Enhanced error handling for GitHub
      let errorCode = err.code;
      let errorMessage = err.message;

      // Handle specific GitHub OAuth errors
      if (err.code === 'auth/account-exists-with-different-credential') {
        showError('Account Exists', 'An account already exists with this email. Please sign in with your original method.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup - don't show error
        return;
      } else if (err.code === 'auth/popup-blocked') {
        showError('Popup Blocked', 'Please allow popups for this site to sign in with GitHub.');
      } else if (err.code === 'auth/network-request-failed') {
        showError('Network Error', 'Please check your internet connection and try again.');
      } else {
        const { title, message } = getErrorMessage(errorCode);
        showError(title, message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email input */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input 
              type="email" 
              id="email"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password input */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input 
              type="password" 
              id="password"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              id="remember-me" 
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button 
            type="button" 
            onClick={handleGithubLogin} 
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
            </svg>
            GitHub
          </button>
        </div>

        {/* Sign up link */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("signup")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                Sign Up
              </button>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Sign Up</span>
            )}
          </p>
        </div>

        {/* Terms and Privacy Links */}
        {onNavigate && (
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={() => onNavigate("terms")}
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
            >
              Terms
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate("privacy")}
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
            >
              Privacy
            </button>
          </div>
        )}
      </form>

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                  setEmailSent(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            {!isSendingReset && !emailSent && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                  💡 Email Delivery Tips:
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                  <li>Check your spam/junk folder if you don't see the email</li>
                  <li>Add noreply emails to your contacts to prevent spam filtering</li>
                  <li>The email may take a few minutes to arrive</li>
                </ul>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            {isSendingReset ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sending email...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={handleForgotPassword}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Send Reset Link
                  </button>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                
                {/* Success Message - Show after email sent */}
                {emailSent && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                          Email Sent Successfully!
                        </p>
                        <div className="text-xs text-green-700 dark:text-green-300 space-y-2">
                          <p>We've sent a password reset link to:</p>
                          <p className="font-mono font-semibold">{resetEmail}</p>
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <p className="font-medium mb-2">If you don't see the email:</p>
                            <ol className="list-decimal list-inside space-y-1 pl-2">
                              <li>Check your <strong>spam/junk folder</strong></li>
                              <li>Wait a few minutes (email delivery can take 1-5 minutes)</li>
                              <li>Verify the email address is correct</li>
                              <li>Add <code className="text-xs bg-green-100 dark:bg-green-900 px-1 rounded">noreply@</code> to your contacts</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmail('');
                        setEmailSent(false);
                      }}
                      className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Got it, thanks!
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 2FA Verification Modal */}
      {showMFA && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
              </div>
              <button
                onClick={() => {
                  setShowMFA(false);
                  setMfaCode('');
                  setMfaVerificationId(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the verification code from your authenticator app.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center text-2xl font-mono tracking-widest"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleMFAVerification}
                disabled={isVerifyingMFA || mfaCode.length !== 6}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifyingMFA ? 'Verifying...' : 'Verify'}
              </button>
              <button
                onClick={() => {
                  setShowMFA(false);
                  setMfaCode('');
                  setMfaVerificationId(null);
                  setMfaResolver(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
