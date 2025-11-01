import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

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
      default:
        return { title: 'Signup Failed', message: 'An unexpected error occurred. Please try again.' };
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
      await createUserWithEmailAndPassword(auth, email, password);
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
      await signInWithPopup(auth, provider);
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
    try {
      await signInWithPopup(auth, provider);
      showSuccess('Account Created', 'Your account has been created with GitHub.');
    } catch (err: any) {
      const { title, message } = getErrorMessage(err.code);
      showError(title, message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSignup}>
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

      {/* Terms checkbox */}
      <div className="flex-row">
        <div>
          <input type="checkbox" id="terms-checkbox" required />
          <label htmlFor="terms-checkbox">
            I agree to the{" "}
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("terms")}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Terms and Conditions
              </button>
            ) : (
              "Terms and Conditions"
            )}
            {" "}and{" "}
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("privacy")}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Privacy Policy
              </button>
            ) : (
              "Privacy Policy"
            )}
          </label>
        </div>
      </div>

      <button type="submit" className="button-submit" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </button>

      <p className="p">Already have an account? <span className="span">Sign In</span></p>
      
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
        <button type="button" className="btn google" onClick={handleGoogleSignup} disabled={isLoading}>
          Google
        </button>
        <button type="button" className="btn github" onClick={handleGithubSignup} disabled={isLoading}>
          GitHub
        </button>
      </div>

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </form>
  );
};

export default SignupPage;

