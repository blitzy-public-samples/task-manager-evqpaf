/**
 * Header Component
 * 
 * Requirements Addressed:
 * - Navigation and User Interaction (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a consistent header component for navigation, user authentication, and theme toggling.
 * 
 * Human Tasks:
 * - Verify navigation links match the application routing configuration
 * - Test responsive behavior across different screen sizes
 * - Ensure theme toggle button has proper contrast in both themes
 */

// react v18.2.0
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components'; // v6.0.0

// Custom hooks
import useAuth from '../../../hooks/useAuth';
import useTheme from '../../../hooks/useTheme';

// Components
import { Button } from '../../../components/common/Button/Button';
import Dropdown from '../../../components/common/Dropdown/Dropdown';

// Constants and types
import { ROUTES } from '../../../constants/routes.constants';
import { CommonStatus } from '../../../types/common.types';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const NavSection = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const StyledLink = styled(Link)`
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-color);
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--border-color);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
`;

const Header: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const userOptions = [
    { value: 'profile', label: 'Profile' },
    { value: 'logout', label: 'Logout' }
  ];

  const handleUserOptionSelect = (value: string) => {
    switch (value) {
      case 'profile':
        navigate(ROUTES.PROFILE);
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <HeaderContainer>
      <NavSection>
        <StyledLink to={ROUTES.DASHBOARD}>Dashboard</StyledLink>
        {isAuthenticated && (
          <>
            <StyledLink to={ROUTES.PROFILE}>Profile</StyledLink>
          </>
        )}
      </NavSection>

      <NavSection>
        <ThemeToggle
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme.backgroundColor === '#FFFFFF' ? '🌙' : '☀️'}
        </ThemeToggle>

        {isAuthenticated ? (
          <Dropdown
            options={userOptions}
            value=""
            onChange={handleUserOptionSelect}
            placeholder={user?.email || 'User menu'}
            width="200px"
          />
        ) : (
          <Button
            label="Login"
            onClick={handleLogin}
            status={CommonStatus.ACTIVE}
          />
        )}
      </NavSection>
    </HeaderContainer>
  );
};

export default Header;