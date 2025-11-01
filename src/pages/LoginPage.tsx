import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

interface LoginPageProps {
  onNavigate?: (route: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const getErrorMessage = (errorCode: string): { title: string; message: string } => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return { title: 'User Not Found', message: 'No account found with this email address.' };
      case 'auth/wrong-password':
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
      default:
        return { title: 'Login Failed', message: 'An unexpected error occurred.' };
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
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess('Login Successful', 'Welcome back!');
    } catch (err: any) {
      const { title, message } = getErrorMessage(err.code);
      showError(title, message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
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
    try {
      await signInWithPopup(auth, provider);
      showSuccess('Login Successful', 'Logged in with GitHub.');
    } catch (err: any) {
      const { title, message } = getErrorMessage(err.code);
      showError(title, message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleLogin}>
      {/* Email input */}
      <div className="flex-column">
        <label>Email</label>
      </div>
      <div className="inputForm">
        <input 
          type="email" 
          className="input" 
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password input */}
      <div className="flex-column">
        <label>Password</label>
      </div>
      <div className="inputForm">
        <input 
          type="password" 
          className="input" 
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Remember & Forgot */}
      <div className="flex-row">
        <div>
          <input type="checkbox" />
          <label>Remember me</label>
        </div>
        <span className="span">Forgot password?</span>
      </div>

      <button type="submit" className="button-submit" disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      <p className="p">Don't have an account? <span className="span">Sign Up</span></p>
      
      {/* Terms and Privacy Links */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-600 dark:text-gray-400">
        {onNavigate && (
          <>
            <button
              onClick={() => onNavigate("terms")}
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
            >
              Terms and Conditions
            </button>
            <span className="text-gray-400">•</span>
            <button
              onClick={() => onNavigate("privacy")}
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
            >
              Privacy Policy
            </button>
          </>
        )}
      </div>

      <p className="p line">Or With</p>

      {/* Social buttons */}
      <div className="flex-row">
        <button type="button" className="btn google" onClick={handleGoogleLogin} disabled={isLoading}>
          Google
        </button>
        <button type="button" className="btn github" onClick={handleGithubLogin} disabled={isLoading}>
          GitHub
        </button>
      </div>

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </form>
  );
};

export default LoginPage;
