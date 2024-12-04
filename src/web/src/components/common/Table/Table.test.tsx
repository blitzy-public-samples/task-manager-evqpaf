// @testing-library/react v14.0.0
import { render, screen, fireEvent, within } from '@testing-library/react';
// react v18.2.0
import React from 'react';
// jest v29.0.0
import '@testing-library/jest-dom';

import Table from './Table';
import { validateEmail } from '../../../utils/validation.utils';
import { BASE_API_URL } from '../../../constants/api.constants';

/**
 * Unit tests for the Table component
 * 
 * Requirements Addressed:
 * - Reusable UI Components Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Ensures the Table component behaves as expected under various scenarios.
 */

describe('Table Component', () => {
  // Mock data for testing
  const mockColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: false }
  ];

  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: '2', name: 'Alice Smith', email: 'alice@example.com', status: 'Inactive' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', status: 'Active' }
  ];

  test('rendersTableCorrectly', () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        pageSize={2}
      />
    );

    // Verify table headers are rendered
    mockColumns.forEach(column => {
      expect(screen.getByText(column.label)).toBeInTheDocument();
    });

    // Verify initial data rows are rendered (first page)
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument(); // Should be on next page

    // Verify pagination is rendered
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeDisabled();
    expect(screen.getByText('Next')).toBeEnabled();
  });

  test('handlesSorting', () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        sortable={true}
      />
    );

    // Get the name column header
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveClass('sortable');

    // Click name header to sort ascending
    fireEvent.click(nameHeader!);
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    expect(within(rows[0]).getByText('Alice Smith')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Bob Wilson')).toBeInTheDocument();
    expect(within(rows[2]).getByText('John Doe')).toBeInTheDocument();

    // Click again to sort descending
    fireEvent.click(nameHeader!);
    const rowsDesc = screen.getAllByRole('row').slice(1);
    expect(within(rowsDesc[0]).getByText('John Doe')).toBeInTheDocument();
    expect(within(rowsDesc[1]).getByText('Bob Wilson')).toBeInTheDocument();
    expect(within(rowsDesc[2]).getByText('Alice Smith')).toBeInTheDocument();

    // Verify non-sortable column
    const statusHeader = screen.getByText('Status').closest('th');
    expect(statusHeader).not.toHaveClass('sortable');
  });

  test('handlesPagination', () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        pageSize={2}
      />
    );

    // Verify initial page
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();

    // Navigate to next page
    fireEvent.click(screen.getByText('Next'));
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();

    // Verify pagination controls
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeEnabled();
    expect(screen.getByText('Next')).toBeDisabled();

    // Navigate back to first page
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
  });

  test('handles empty data state', () => {
    render(
      <Table
        columns={mockColumns}
        data={[]}
        emptyMessage="No records found"
      />
    );

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  test('handles loading state', () => {
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        loading={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('handles row click callback', () => {
    const onRowClick = jest.fn();
    render(
      <Table
        columns={mockColumns}
        data={mockData}
        onRowClick={onRowClick}
      />
    );

    // Click the first row
    fireEvent.click(screen.getByText('John Doe'));
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  test('handles custom column formatter', () => {
    const columnsWithFormatter = [
      ...mockColumns,
      {
        key: 'email',
        label: 'Validated Email',
        formatter: (value: string) => validateEmail(value) ? '✓' : '✗'
      }
    ];

    render(
      <Table
        columns={columnsWithFormatter}
        data={mockData}
      />
    );

    // Verify formatted values
    const validEmails = screen.getAllByText('✓');
    expect(validEmails).toHaveLength(mockData.length);
  });
});