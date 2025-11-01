import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { createUserProfile } from '../services/userService';

interface SignupPageProps {
  onNavigate?: (route: string) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const getErrorMessage = (errorCode: string): { title: string; message: string } => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return { title: 'Email Already Exists', message: 'An account with this email already exists. Please try logging in instead.' };
      case 'auth/weak-password':
        return { title: 'Weak Password', message: 'Password should be at least 6 characters long.' };
      case 'auth/invalid-email':
        return { title: 'Invalid Email', message: 'Please enter a valid email address.' };
      case 'auth/operation-not-allowed':
        return { title: 'Signup Disabled', message: 'Email/password signup is currently disabled.' };
      case 'auth/network-request-failed':
        return { title: 'Network Error', message: 'Please check your internet connection and try again.' };
      case 'auth/popup-closed-by-user':
        return { title: 'Signup Cancelled', message: 'Social signup was cancelled.' };
      case 'auth/popup-blocked':
        return { title: 'Popup Blocked', message: 'Please allow popups for this site to use social signup.' };
      case 'auth/account-exists-with-different-credential':
        return { title: 'Account Exists', message: 'An account already exists with this email using a different sign-in method.' };
      case 'auth/oauth-handler-domain-mismatch':
      case 'auth/unauthorized-domain':
        return { title: 'Configuration Error', message: 'GitHub OAuth is not properly configured. Please contact support.' };
      default:
        return { title: 'Signup Failed', message: errorCode || 'An unexpected error occurred. Please try again.' };
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Missing Information', 'Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      showError('Weak Password', 'Password should be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile in Firestore
      await createUserProfile(userCredential.user, 'email');
      showSuccess('Account Created', 'Your account has been created successfully.');
    } catch (err: any) {
      const { title, message } = getErrorMessage(err.code);
      showError(title, message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Create or update user profile in Firestore
      await createUserProfile(result.user, 'google');
      showSuccess('Account Created', 'Your account has been created with Google.');
    } catch (err: any) {
      const { title, message } = getErrorMessage(err.code);
      showError(title, message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignup = async () => {
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
      showSuccess('Account Created', 'Your account has been created with GitHub.');
    } catch (err: any) {
      // Enhanced error handling for GitHub
      if (err.code === 'auth/account-exists-with-different-credential') {
        showError('Account Exists', 'An account already exists with this email. Please sign in instead.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup - don't show error
        return;
      } else if (err.code === 'auth/popup-blocked') {
        showError('Popup Blocked', 'Please allow popups for this site to sign up with GitHub.');
      } else if (err.code === 'auth/network-request-failed') {
        showError('Network Error', 'Please check your internet connection and try again.');
      } else {
        const { title, message } = getErrorMessage(err.code);
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
          Create Account
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign up to get started with LegalEase AI
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        {/* Email input */}
        <div className="space-y-2">
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              id="signup-email"
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
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              id="signup-password"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Must be at least 6 characters</p>
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start space-x-3 pt-2">
          <input 
            type="checkbox" 
            id="terms-checkbox" 
            required
            className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
          />
          <label htmlFor="terms-checkbox" className="text-sm text-gray-700 dark:text-gray-300">
            I agree to the{" "}
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("terms")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
              >
                Terms and Conditions
              </button>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-medium">Terms and Conditions</span>
            )}
            {" "}and{" "}
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("privacy")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
              >
                Privacy Policy
              </button>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-medium">Privacy Policy</span>
            )}
          </label>
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
              Creating Account...
            </span>
          ) : (
            'Create Account'
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
            onClick={handleGoogleSignup} 
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
            onClick={handleGithubSignup} 
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
            </svg>
            GitHub
          </button>
        </div>

        {/* Sign in link */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("login")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                Sign In
              </button>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Sign In</span>
            )}
          </p>
        </div>
      </form>

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default SignupPage;

