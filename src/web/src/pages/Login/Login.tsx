/**
 * Login Page Component
 * 
 * Requirements Addressed:
 * - Authentication UI (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a user interface for logging in, including input fields for email and password,
 *   and a login button.
 * - Error Handling (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Handles errors such as invalid credentials and displays appropriate messages to the user.
 * 
 * Human Tasks:
 * - Verify that error messages match UX requirements
 * - Ensure form validation aligns with backend requirements
 * - Test accessibility with screen readers
 * - Verify WCAG 2.1 Level AA compliance
 */

import React, { useState, useCallback } from 'react'; // ^18.2.0
import { AuthCredentials } from '../../interfaces/auth.interface';
import { BASE_API_URL } from '../../constants/api.constants';
import { makeApiRequest } from '../../utils/api.utils';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import Notification from '../../components/common/Notification/Notification';

const Login: React.FC = () => {
  // State for form fields and error handling
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get authentication methods from useAuth hook
  const { login } = useAuth();

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Prepare credentials object
      const credentials: AuthCredentials = {
        email,
        password
      };

      // Attempt to login
      await login(credentials);

      // Clear form fields on success
      setEmail('');
      setPassword('');
    } catch (err) {
      // Handle login errors
      setError(
        err instanceof Error 
          ? err.message 
          : 'An error occurred during login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email Input */}
            <Input
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email address"
              label="Email address"
              required
              id="email"
              name="email"
              autoComplete="email"
              disabled={isLoading}
            />

            {/* Password Input */}
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              label="Password"
              required
              id="password"
              name="password"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {/* Error Notification */}
          {error && (
            <Notification
              message={error}
              type="error"
              onClose={() => setError(null)}
              duration={5000}
            />
          )}

          {/* Submit Button */}
          <div>
            <Button
              label={isLoading ? 'Signing in...' : 'Sign in'}
              onClick={() => {}} // Form submit handles the action
              disabled={isLoading}
            />
          </div>
        </form>

        {/* Additional Links */}
        <div className="text-center mt-4">
          <a
            href="#"
            className="font-medium text-blue-600 hover:text-blue-500"
            onClick={(e) => {
              e.preventDefault();
              // Handle forgot password - implementation pending
            }}
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;