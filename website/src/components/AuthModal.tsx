import React, {useState, useCallback, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {useAuth} from './AuthProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess: () => void;
  /** Called after a successful signin — parent decides whether to show the questionnaire. */
  onSigninSuccess?: () => void;
  /** Ref to the button that triggered the modal — focus returns here on close. */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

type Tab = 'signin' | 'signup';

export default function AuthModal({
  isOpen,
  onClose,
  onSignupSuccess,
  onSigninSuccess,
  triggerRef,
}: AuthModalProps): React.JSX.Element | null {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {signup, signin} = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setError(null);
  }, []);

  const handleTabChange = useCallback(
    (newTab: Tab) => {
      setTab(newTab);
      resetForm();
    },
    [resetForm],
  );

  // Close and return focus to trigger element
  const closeAndReturnFocus = useCallback(() => {
    onClose();
    triggerRef?.current?.focus();
  }, [onClose, triggerRef]);

  // Focus trap + Escape-to-close
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Focus the first focusable element on open
    const getFocusable = () =>
      modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]',
      );

    const focusableEls = getFocusable();
    if (focusableEls.length > 0) {
      focusableEls[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAndReturnFocus();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAndReturnFocus]);

  const validate = (): string | null => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    if (tab === 'signup' && password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!password) {
      return 'Password is required';
    }
    return null;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (tab === 'signup') {
          await signup(email, password);
          onSignupSuccess();
        } else {
          await signin(email, password);
          if (onSigninSuccess) {
            onSigninSuccess();
          } else {
            onClose();
          }
        }
        resetForm();
      } catch (err) {
        if (err instanceof TypeError) {
          // Network error (fetch failed, CORS, timeout)
          setError('Something went wrong. Please check your connection and try again.');
        } else if (err instanceof Error && err.message.includes('500')) {
          // Server error
          setError('Something went wrong. Please try again later.');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, tab, signup, signin, onClose, onSignupSuccess, onSigninSuccess, resetForm],
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="auth-modal-overlay" onClick={closeAndReturnFocus}>
      <div
        className="auth-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="auth-modal-close"
          onClick={closeAndReturnFocus}
          type="button"
          aria-label="Close">
          &times;
        </button>

        <div className="auth-modal-tabs">
          <button
            className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => handleTabChange('signin')}
            type="button">
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => handleTabChange('signup')}
            type="button">
            Sign Up
          </button>
        </div>

        <h2 id="auth-modal-title" className="sr-only">
          {tab === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'Min 8 characters' : 'Your password'}
              autoComplete={
                tab === 'signup' ? 'new-password' : 'current-password'
              }
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className={`auth-submit-btn${loading ? ' is-loading' : ''}`}
            disabled={loading}>
            {loading
              ? '...'
              : tab === 'signup'
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        {/* OAuth placeholder buttons */}
        <div className="auth-oauth-section">
          <div className="auth-oauth-divider">or continue with</div>
          <div className="auth-oauth-buttons">
            <button type="button" className="auth-oauth-btn" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" className="auth-oauth-btn" disabled>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
