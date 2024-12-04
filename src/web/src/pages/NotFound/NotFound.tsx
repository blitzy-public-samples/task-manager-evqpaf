/**
 * NotFound Page Component
 * 
 * Requirements Addressed:
 * - Error Handling and User Experience (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Provides a user-friendly interface for handling 404 errors, ensuring users are guided back to valid pages.
 * 
 * Human Tasks:
 * - Verify that the error page styling matches the design system
 * - Test accessibility of error page with screen readers
 * - Ensure proper tracking of 404 errors in analytics
 */

import React from 'react'; // v18.2.0
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components'; // v6.0.0

// Components
import { Button } from '../../components/common/Button/Button';
import Header from '../../components/layout/Header/Header';

// Constants and utilities
import { ROUTES } from '../../constants/routes.constants';
import { applyTheme } from '../../styles/theme';
import { LIGHT_THEME } from '../../constants/theme.constants';

// Styled components
const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: all 0.3s ease-in-out;
`;

const ContentContainer = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: 6rem;
  margin: 0;
  color: var(--primary-color);
  font-weight: 700;
  line-height: 1;
`;

const ErrorMessage = styled.h2`
  font-size: 2rem;
  margin: 1rem 0 2rem;
  font-weight: 500;
`;

const ErrorDescription = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
  color: var(--text-color);
  opacity: 0.8;
`;

const NotFound: React.FC = () => {
  // Initialize navigation
  const navigate = useNavigate();

  // Apply theme
  applyTheme(LIGHT_THEME);

  // Handle navigation back to dashboard
  const handleBackToDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <NotFoundContainer>
      <Header />
      <ContentContainer>
        <ErrorCode aria-label="Error code 404">404</ErrorCode>
        <ErrorMessage>Page Not Found</ErrorMessage>
        <ErrorDescription>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable. Please check the URL or return to the dashboard.
        </ErrorDescription>
        <Button
          label="Back to Dashboard"
          onClick={handleBackToDashboard}
          aria-label="Navigate back to dashboard"
        />
      </ContentContainer>
    </NotFoundContainer>
  );
};

export default NotFound;