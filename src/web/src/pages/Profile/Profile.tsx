/**
 * Profile Page Component
 * 
 * Requirements Addressed:
 * - User Profile Management (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a user interface for managing profile information, including viewing and updating user details.
 * - Input Validation (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Ensures consistent and reusable validation utilities for user inputs, enhancing data integrity and user experience.
 * - Authentication State Management (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Manages user authentication state to ensure secure access to profile management functionalities.
 * 
 * Human Tasks:
 * - Verify that profile update API endpoint is properly configured
 * - Ensure proper error handling for profile updates
 * - Test form validation with various input scenarios
 * - Verify proper cleanup of auth state on logout
 */

import React, { useState, useCallback } from 'react'; // ^18.2.0
import { UserInterface } from '../../interfaces/user.interface';
import useAuth from '../../hooks/useAuth';
import { Button } from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { logout } from '../../services/auth.service';
import { validateEmail } from '../../utils/validation.utils';

const Profile: React.FC = () => {
  // Get current user and auth methods from useAuth hook
  const { user, login } = useAuth();

  // Local state for form fields
  const [formData, setFormData] = useState<Partial<UserInterface>>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });

  // State for form submission and errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof UserInterface) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any previous messages
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error('All fields are required');
      }

      // Validate email format
      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // TODO: Implement profile update API call
      // For now, simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      // Redirect will be handled by auth state change
    } catch (err) {
      setError('Failed to logout. Please try again.');
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name Input */}
        <div>
          <Input
            type="text"
            value={formData.firstName || ''}
            onChange={handleInputChange('firstName')}
            label="First Name"
            required
            id="firstName"
            placeholder="Enter your first name"
            disabled={isSubmitting}
          />
        </div>

        {/* Last Name Input */}
        <div>
          <Input
            type="text"
            value={formData.lastName || ''}
            onChange={handleInputChange('lastName')}
            label="Last Name"
            required
            id="lastName"
            placeholder="Enter your last name"
            disabled={isSubmitting}
          />
        </div>

        {/* Email Input */}
        <div>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={handleInputChange('email')}
            label="Email"
            required
            id="email"
            placeholder="Enter your email"
            disabled={isSubmitting}
            validate={validateEmail}
            errorMessage="Please enter a valid email address"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            label="Save Changes"
            onClick={() => {}} // Form submit will handle this
            disabled={isSubmitting}
          />
          
          <Button
            label="Logout"
            onClick={handleLogout}
            disabled={isSubmitting}
            status="INACTIVE"
          />
        </div>
      </form>
    </div>
  );
};

export default Profile;