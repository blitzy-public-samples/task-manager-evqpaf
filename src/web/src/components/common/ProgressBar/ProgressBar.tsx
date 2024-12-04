/**
 * ProgressBar Component
 * 
 * Requirements Addressed:
 * - Visual Hierarchy (Technical Specification/3.1 User Interface Design/3.1.1 Design Specifications)
 *   Provides a visual representation of progress using a progress bar component.
 * 
 * Human Tasks:
 * - Verify that progress bar colors meet WCAG accessibility contrast requirements
 * - Test progress bar animations across different browsers
 * - Ensure smooth transitions when progress value changes
 */

// External dependencies
// classnames v2.3.2
import classnames from 'classnames';

// Internal dependencies
import { ThemeType } from '../../../types/theme.types';
import { applyTheme } from '../../../styles/theme';
import { truncate } from '../../../utils/string.utils';

interface ProgressBarProps {
  /**
   * The current progress value (0-100)
   */
  progress: number;

  /**
   * Optional label to display above the progress bar
   */
  label?: string;

  /**
   * Optional theme override for the progress bar
   */
  theme?: ThemeType;
}

/**
 * A reusable progress bar component that visualizes progress with customizable styles.
 * 
 * @param progress - Number between 0 and 100 representing the progress
 * @param label - Optional label text to display above the progress bar
 * @param theme - Optional theme override for custom styling
 * @returns JSX.Element
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  theme 
}) => {
  // Validate and clamp progress value between 0 and 100
  const normalizedProgress = Math.min(Math.max(0, progress), 100);

  // Apply custom theme if provided
  React.useEffect(() => {
    if (theme) {
      applyTheme(theme);
    }
  }, [theme]);

  // Truncate label if it's too long (max 50 characters)
  const displayLabel = label ? truncate(label, 50) : null;

  return (
    <div 
      className={classnames('progress-bar-container', {
        'with-label': !!displayLabel
      })}
      role="progressbar"
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={displayLabel || 'Progress'}
    >
      {displayLabel && (
        <div className="progress-bar-label">
          {displayLabel}
          <span className="progress-value">{`${normalizedProgress}%`}</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div 
          className={classnames('progress-bar-fill', {
            'complete': normalizedProgress === 100
          })}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      <style jsx>{`
        .progress-bar-container {
          width: 100%;
          margin: 1rem 0;
        }

        .progress-bar-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-color);
        }

        .progress-value {
          font-weight: 600;
        }

        .progress-bar-track {
          width: 100%;
          height: 0.5rem;
          background-color: var(--border-color);
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--primary-color);
          border-radius: 0.25rem;
          transition: width 0.3s ease-in-out;
        }

        .progress-bar-fill.complete {
          background-color: var(--secondary-color);
        }

        @media (prefers-reduced-motion: reduce) {
          .progress-bar-fill {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;