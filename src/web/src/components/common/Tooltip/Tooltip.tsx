/**
 * A reusable Tooltip component that displays additional information when a user hovers over or focuses on an element.
 * 
 * Requirements Addressed:
 * - User Interface Design (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a consistent and accessible tooltip component for displaying contextual information.
 * 
 * Human Tasks:
 * - Verify tooltip positioning works correctly across different screen sizes
 * - Test keyboard accessibility for focus management
 * - Ensure tooltip content is readable with all theme combinations
 */

// classnames v2.3.2
import classnames from 'classnames';
import { ReactNode, useState, useRef, useEffect } from 'react';
import useTheme from '../../../hooks/useTheme';
import { applyTheme } from '../../../styles/theme';
import { ThemeType } from '../../../types/theme.types';
import { capitalize } from '../../../utils/string.utils';

interface TooltipProps {
  /**
   * The content to be displayed inside the tooltip
   */
  content: string | ReactNode;
  
  /**
   * The position of the tooltip relative to the target element
   */
  position?: 'top' | 'right' | 'bottom' | 'left';
  
  /**
   * Optional theme override for the tooltip
   */
  theme?: Partial<ThemeType>;
  
  /**
   * The element that triggers the tooltip
   */
  children: ReactNode;
  
  /**
   * Optional CSS class name for custom styling
   */
  className?: string;
  
  /**
   * Optional delay before showing the tooltip (in milliseconds)
   */
  showDelay?: number;
  
  /**
   * Optional delay before hiding the tooltip (in milliseconds)
   */
  hideDelay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  theme: customTheme,
  children,
  className,
  showDelay = 200,
  hideDelay = 100
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({ top: 0, left: 0 });
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { theme: currentTheme } = useTheme();
  const mergedTheme = customTheme ? applyTheme({ ...currentTheme, ...customTheme }) : currentTheme;

  useEffect(() => {
    return () => {
      // Cleanup timeouts on unmount
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const calculatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top + scrollY - tooltipRect.height - 8;
        left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'right':
        top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + scrollX + 8;
        break;
      case 'bottom':
        top = targetRect.bottom + scrollY + 8;
        left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left + scrollX - tooltipRect.width - 8;
        break;
    }

    setCoordinates({ top, left });
  };

  const handleShow = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Wait for next frame to ensure tooltip is rendered before calculating position
      requestAnimationFrame(calculatePosition);
    }, showDelay);
  };

  const handleHide = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  const tooltipContent = typeof content === 'string' ? capitalize(content) : content;

  const tooltipClasses = classnames(
    'tooltip',
    `tooltip--${position}`,
    {
      'tooltip--visible': isVisible
    },
    className
  );

  const tooltipStyles = {
    '--tooltip-background': mergedTheme.backgroundColor,
    '--tooltip-text': mergedTheme.textColor,
    '--tooltip-border': mergedTheme.borderColor,
    top: coordinates.top,
    left: coordinates.left
  } as React.CSSProperties;

  return (
    <div
      ref={targetRef}
      className="tooltip-wrapper"
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={tooltipClasses}
          style={tooltipStyles}
          role="tooltip"
          aria-live="polite"
        >
          {tooltipContent}
        </div>
      )}

      <style jsx>{`
        .tooltip-wrapper {
          display: inline-block;
          position: relative;
        }

        .tooltip {
          position: fixed;
          z-index: 1000;
          padding: 8px 12px;
          background-color: var(--tooltip-background);
          color: var(--tooltip-text);
          border: 1px solid var(--tooltip-border);
          border-radius: 4px;
          font-size: 14px;
          line-height: 1.4;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .tooltip--visible {
          opacity: 1;
        }

        .tooltip::before {
          content: '';
          position: absolute;
          border: 6px solid transparent;
        }

        .tooltip--top::before {
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          border-top-color: var(--tooltip-border);
        }

        .tooltip--right::before {
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          border-right-color: var(--tooltip-border);
        }

        .tooltip--bottom::before {
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          border-bottom-color: var(--tooltip-border);
        }

        .tooltip--left::before {
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          border-left-color: var(--tooltip-border);
        }
      `}</style>
    </div>
  );
};

export default Tooltip;