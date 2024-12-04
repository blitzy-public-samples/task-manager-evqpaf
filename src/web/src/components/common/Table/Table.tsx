/**
 * Reusable Table Component
 * 
 * Requirements Addressed:
 * - Reusable UI Components (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Provides a reusable and customizable table component for displaying data in a tabular format.
 * 
 * Human Tasks:
 * - Verify table accessibility features meet WCAG guidelines
 * - Test table responsiveness across different screen sizes
 * - Ensure table sorting performance is optimized for large datasets
 */

// react v18.2.0
import React, { useState, useCallback, useMemo } from 'react';
// prop-types v15.8.1
import PropTypes from 'prop-types';

import { CommonStatus } from '../../../types/common.types';
import { makeApiRequest } from '../../../utils/api.utils';
import { capitalize } from '../../../utils/string.utils';
import useAuth from '../../../hooks/useAuth';
import useNotification from '../../../hooks/useNotification';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  formatter?: (value: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
  sortable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  onRowClick,
  sortable = true,
  loading = false,
  emptyMessage = 'No data available',
  pageSize = 10
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { isAuthenticated } = useAuth();
  const { triggerNotification } = useNotification();

  // Memoized sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig, sortable]);

  // Memoized paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handle column header click for sorting
  const handleSort = useCallback((key: string) => {
    if (!sortable) return;

    setSortConfig((prevConfig) => {
      if (!prevConfig || prevConfig.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prevConfig.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  }, [sortable]);

  // Handle row click with authentication check
  const handleRowClick = useCallback((row: any) => {
    if (!onRowClick) return;

    if (!isAuthenticated) {
      triggerNotification({
        message: 'Please log in to interact with table rows',
        type: 'warning',
        duration: 3000
      });
      return;
    }

    onRowClick(row);
  }, [onRowClick, isAuthenticated, triggerNotification]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div className="table-container">
      {loading ? (
        <div className="table-loading">Loading...</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                    className={`table-header ${
                      column.sortable !== false ? 'sortable' : ''
                    } ${
                      sortConfig?.key === column.key ? `sorted-${sortConfig.direction}` : ''
                    }`}
                  >
                    {column.label || capitalize(column.key)}
                    {column.sortable !== false && (
                      <span className="sort-indicator">
                        {sortConfig?.key === column.key && (
                          sortConfig.direction === 'asc' ? '▲' : '▼'
                        )}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    onClick={() => handleRowClick(row)}
                    className={`table-row ${onRowClick ? 'clickable' : ''} ${
                      row.status === CommonStatus.INACTIVE ? 'inactive' : ''
                    }`}
                  >
                    {columns.map((column) => (
                      <td key={`${row.id || rowIndex}-${column.key}`}>
                        {column.formatter
                          ? column.formatter(row[column.key])
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="empty-message">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .table-container {
          width: 100%;
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          border-spacing: 0;
        }

        .table-header {
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid var(--border-color);
          font-weight: 600;
        }

        .table-header.sortable {
          cursor: pointer;
          user-select: none;
        }

        .table-header.sortable:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .sort-indicator {
          margin-left: 4px;
          font-size: 0.8em;
        }

        .table-row {
          border-bottom: 1px solid var(--border-color);
        }

        .table-row.clickable {
          cursor: pointer;
        }

        .table-row.clickable:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }

        .table-row.inactive {
          opacity: 0.6;
        }

        td {
          padding: 12px;
        }

        .empty-message {
          text-align: center;
          padding: 24px;
          color: var(--text-secondary);
        }

        .table-loading {
          text-align: center;
          padding: 24px;
          color: var(--text-secondary);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
          gap: 16px;
        }

        .pagination-button {
          padding: 8px 16px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: none;
          cursor: pointer;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-button:hover:not(:disabled) {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .page-info {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      sortable: PropTypes.bool,
      formatter: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func,
  sortable: PropTypes.bool,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  pageSize: PropTypes.number
};

export default Table;