/**
 * Footer Component
 * 
 * Human Tasks:
 * - Verify that all navigation links are correctly mapped to routes
 * - Ensure theme toggle button meets accessibility standards
 * - Test responsive layout across different screen sizes
 * - Confirm smooth theme transition animations
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ROUTES } from '../../../constants/routes.constants';
import useTheme from '../../../hooks/useTheme';
import { applyTheme } from '../../../styles/theme';
import '../../../styles/global.css';

// Styled components for the Footer
const FooterContainer = styled.footer`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--background-color);
  border-top: 1px solid var(--border-color);
  transition: background-color var(--transition-normal) var(--transition-timing),
              border-color var(--transition-normal) var(--transition-timing);

  @media (max-width: 768px) {
    padding: var(--spacing-md) var(--spacing-sm);
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const FooterTitle = styled.h3`
  font-size: var(--font-size-lg);
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-bold);
`;

const FooterLink = styled(Link)`
  color: var(--text-color);
  text-decoration: none;
  transition: color var(--transition-fast) var(--transition-timing);
  font-size: var(--font-size-base);

  &:hover {
    color: var(--primary-color);
  }
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast) var(--transition-timing);

  &:hover {
    background-color: var(--primary-color);
    color: var(--background-color);
    border-color: var(--primary-color);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
`;

const Copyright = styled.p`
  color: var(--text-color);
  font-size: var(--font-size-sm);
  text-align: center;
  margin-top: var(--spacing-lg);
  opacity: 0.8;
`;

/**
 * Footer component providing navigation links, copyright information, and theme toggling.
 * 
 * Requirements Addressed:
 * - Responsive Design (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 * - Theme Support (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 * - Route Management (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 */
const Footer: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>Navigation</FooterTitle>
          <FooterLink to={ROUTES.DASHBOARD}>Dashboard</FooterLink>
          <FooterLink to={ROUTES.PROJECTS}>Projects</FooterLink>
          <FooterLink to={ROUTES.TASKS}>Tasks</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Account</FooterTitle>
          <FooterLink to={ROUTES.PROFILE}>Profile</FooterLink>
          <FooterLink to={ROUTES.LOGIN}>Login</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Preferences</FooterTitle>
          <ThemeToggle
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle between light and dark theme"
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </ThemeToggle>
        </FooterSection>
      </FooterContent>

      <Copyright>
        © {new Date().getFullYear()} Task Management System. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;