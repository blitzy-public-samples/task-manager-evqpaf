/**
 * Requirements Addressed:
 * - User Interface Design (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a tabbed navigation component to organize and display content in a structured 
 *   and user-friendly manner.
 * 
 * Human Tasks:
 * - Verify tab transition animations meet accessibility requirements
 * - Ensure keyboard navigation support meets WCAG guidelines
 * - Confirm color contrast ratios for active/inactive tab states
 */

import React, { useState, useCallback } from 'react';
// classnames v2.3.2
import classnames from 'classnames';
import { ThemeType } from '../../../types/theme.types';
import { capitalize, isEmptyOrWhitespace } from '../../../utils/string.utils';

interface TabsProps {
  /**
   * Array of tab labels to display
   */
  tabs: string[];
  
  /**
   * Index of the currently active tab
   */
  activeTab?: number;
  
  /**
   * Callback function when a tab is selected
   */
  onTabChange?: (index: number) => void;
  
  /**
   * Optional theme object for custom styling
   */
  theme?: ThemeType;
  
  /**
   * Optional CSS class name for custom styling
   */
  className?: string;
  
  /**
   * Content to display in each tab panel
   */
  children: React.ReactNode[];
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab = 0,
  onTabChange,
  theme,
  className,
  children
}) => {
  // State for internal tab management when not controlled externally
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);

  // Determine if component is controlled or uncontrolled
  const currentTab = typeof activeTab === 'number' ? activeTab : internalActiveTab;

  // Validate tabs array
  if (!Array.isArray(tabs) || tabs.length === 0) {
    console.error('Tabs component requires a non-empty array of tab labels');
    return null;
  }

  // Validate children count matches tabs count
  if (!Array.isArray(children) || children.length !== tabs.length) {
    console.error('Number of children must match number of tabs');
    return null;
  }

  // Validate tab labels
  const validTabs = tabs.every(tab => !isEmptyOrWhitespace(tab));
  if (!validTabs) {
    console.error('All tab labels must be non-empty strings');
    return null;
  }

  // Handle tab selection
  const handleTabClick = useCallback((index: number) => {
    if (index === currentTab) return;

    if (onTabChange) {
      onTabChange(index);
    } else {
      setInternalActiveTab(index);
    }
  }, [currentTab, onTabChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabClick(index);
    }
  }, [handleTabClick]);

  return (
    <div 
      className={classnames('tabs-container', className)}
      style={{
        borderColor: theme?.borderColor,
        backgroundColor: theme?.backgroundColor
      }}
    >
      <div 
        role="tablist"
        className="tabs-header"
        aria-label="Tab Navigation"
      >
        {tabs.map((tab, index) => (
          <button
            key={`tab-${index}`}
            role="tab"
            aria-selected={currentTab === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            className={classnames('tab-button', {
              'active': currentTab === index
            })}
            onClick={() => handleTabClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={currentTab === index ? 0 : -1}
            style={{
              color: currentTab === index ? theme?.primaryColor : theme?.textColor,
              borderColor: currentTab === index ? theme?.primaryColor : 'transparent'
            }}
          >
            {capitalize(tab)}
          </button>
        ))}
      </div>
      
      <div className="tabs-content">
        {children.map((child, index) => (
          <div
            key={`tabpanel-${index}`}
            role="tabpanel"
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            hidden={currentTab !== index}
            className={classnames('tab-panel', {
              'active': currentTab === index
            })}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;