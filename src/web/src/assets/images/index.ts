// Import icons for consistent asset management
import { icons } from '../icons';

// Requirement: Centralized Image Management (3.1.2 Interface Elements)
// This object exports all images used throughout the application
// ensuring consistent image usage and centralized management

// Logo Images
import logoFull from './logo/logo-full.png';
import logoIcon from './logo/logo-icon.png';
import logoLight from './logo/logo-light.png';
import logoDark from './logo/logo-dark.png';

// Background Images
import loginBg from './backgrounds/login-bg.jpg';
import dashboardBg from './backgrounds/dashboard-bg.jpg';
import emptyStateBg from './backgrounds/empty-state-bg.svg';

// Placeholder Images
import userPlaceholder from './placeholders/user-placeholder.png';
import projectPlaceholder from './placeholders/project-placeholder.png';
import teamPlaceholder from './placeholders/team-placeholder.png';

// Illustration Images
import welcomeIllustration from './illustrations/welcome.svg';
import emptyStateIllustration from './illustrations/empty-state.svg';
import errorIllustration from './illustrations/error.svg';
import successIllustration from './illustrations/success.svg';

// Marketing Images
import featureCollaboration from './marketing/feature-collaboration.png';
import featureTracking from './marketing/feature-tracking.png';
import featureReporting from './marketing/feature-reporting.png';

// Onboarding Images
import onboardingStep1 from './onboarding/step-1.svg';
import onboardingStep2 from './onboarding/step-2.svg';
import onboardingStep3 from './onboarding/step-3.svg';
import onboardingStep4 from './onboarding/step-4.svg';

// Export all images as a single object for consistent usage across the application
export const images = {
  // Logo Variations
  logo: {
    full: logoFull,
    icon: logoIcon,
    light: logoLight,
    dark: logoDark,
  },

  // Background Images
  backgrounds: {
    login: loginBg,
    dashboard: dashboardBg,
    emptyState: emptyStateBg,
  },

  // Placeholder Images
  placeholders: {
    user: userPlaceholder,
    project: projectPlaceholder,
    team: teamPlaceholder,
  },

  // Illustration Images
  illustrations: {
    welcome: welcomeIllustration,
    emptyState: emptyStateIllustration,
    error: errorIllustration,
    success: successIllustration,
  },

  // Marketing Feature Images
  marketing: {
    collaboration: featureCollaboration,
    tracking: featureTracking,
    reporting: featureReporting,
  },

  // Onboarding Step Images
  onboarding: {
    step1: onboardingStep1,
    step2: onboardingStep2,
    step3: onboardingStep3,
    step4: onboardingStep4,
  },
};