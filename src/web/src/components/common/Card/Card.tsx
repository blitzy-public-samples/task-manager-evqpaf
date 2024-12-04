/**
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a reusable and styled Card component for consistent content presentation.
 * 
 * Human Tasks:
 * - Verify that card styles align with design system specifications
 * - Ensure card animations and transitions perform well on target devices
 * - Test card accessibility with screen readers
 */

// React v18.2.0
import React, { ReactNode } from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';
import { CommonStatus } from '../../../types/common.types';
import { applyTheme } from '../../../styles/theme';
import { capitalize } from '../../../utils/string.utils';

interface CardProps {
  /** Title to be displayed in the card header */
  title?: string;
  /** Content to be displayed in the card body */
  children: ReactNode;
  /** Status to be displayed in the card footer */
  status?: string;
  /** Additional CSS classes to be applied to the card */
  className?: string;
}

/**
 * A styled container component for displaying content with optional header, footer,
 * and body sections.
 */
export class Card extends React.Component<CardProps> {
  static propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    status: PropTypes.string,
    className: PropTypes.string
  };

  static defaultProps = {
    title: '',
    status: '',
    className: ''
  };

  constructor(props: CardProps) {
    super(props);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
  }

  /**
   * Renders the header section of the Card if a title is provided.
   * @returns The header JSX element or null if no title is provided.
   */
  renderHeader(): ReactNode {
    const { title } = this.props;

    if (!title) {
      return null;
    }

    return (
      <div className="card-header" style={{
        padding: '1rem',
        borderBottom: 'var(--border-color) 1px solid',
        backgroundColor: 'var(--background-color)',
      }}>
        <h3 style={{
          margin: 0,
          color: 'var(--text-color)',
          fontSize: '1.25rem',
          fontWeight: 500
        }}>
          {capitalize(title)}
        </h3>
      </div>
    );
  }

  /**
   * Renders the footer section of the Card if a status is provided.
   * @returns The footer JSX element or null if no status is provided.
   */
  renderFooter(): ReactNode {
    const { status } = this.props;

    if (!status) {
      return null;
    }

    const statusColor = status === CommonStatus.ACTIVE ? 'var(--primary-color)' :
                       status === CommonStatus.INACTIVE ? '#757575' :
                       status === CommonStatus.PENDING ? 'var(--secondary-color)' :
                       'var(--text-color)';

    return (
      <div className="card-footer" style={{
        padding: '0.75rem 1rem',
        borderTop: 'var(--border-color) 1px solid',
        backgroundColor: 'var(--background-color)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{
          color: statusColor,
          fontSize: '0.875rem',
          fontWeight: 500
        }}>
          {capitalize(status)}
        </span>
      </div>
    );
  }

  render(): ReactNode {
    const { children, className } = this.props;

    return (
      <div 
        className={`card ${className}`.trim()}
        style={{
          backgroundColor: 'var(--background-color)',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: 'var(--border-color) 1px solid',
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
          ':hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        {this.renderHeader()}
        <div className="card-body" style={{
          padding: '1rem',
          color: 'var(--text-color)'
        }}>
          {children}
        </div>
        {this.renderFooter()}
      </div>
    );
  }
}