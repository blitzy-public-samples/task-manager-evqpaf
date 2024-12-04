/**
 * Unit and integration tests for the FileUpload component
 * 
 * Requirements Addressed:
 * - File Upload Component Testing (Technical Specification/3.1 User Interface Design/3.1.2 Interface Elements)
 *   Tests file selection, validation, drag-and-drop functionality, and API integration.
 * 
 * Human Tasks:
 * - Verify test coverage meets project requirements
 * - Ensure mock API responses match production API format
 * - Configure CI/CD pipeline to run these tests
 */

// @testing-library/react v13.4.0
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
// jest v29.0.0
import '@testing-library/jest-dom';
import FileUpload from './FileUpload';
import { makeApiRequest } from '../../../utils/api.utils';
import { setItem } from '../../../utils/storage.utils';
import { BASE_API_URL } from '../../../constants/api.constants';

// Mock dependencies
jest.mock('../../../utils/api.utils');
jest.mock('../../../utils/storage.utils');
jest.mock('../../../hooks/useNotification', () => ({
  __esModule: true,
  default: () => ({
    triggerNotification: jest.fn()
  })
}));

describe('FileUpload Component', () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnUploadError = jest.fn();
  const defaultProps = {
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/*', 'application/pdf'],
    multiple: false,
    onUploadComplete: mockOnUploadComplete,
    onUploadError: mockOnUploadError
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders file upload component with default props', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText('Drag and drop files here or')).toBeInTheDocument();
    expect(screen.getByText('Browse Files')).toBeInTheDocument();
  });

  it('handles file selection through input', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Browse Files');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('Upload Files')).toBeInTheDocument();
    });
  });

  it('validates file size', async () => {
    render(<FileUpload {...defaultProps} maxFileSize={1024} />);
    
    const largeFile = new File(['x'.repeat(2048)], 'large.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Browse Files');
    
    fireEvent.change(input, { target: { files: [largeFile] } });
    
    await waitFor(() => {
      expect(screen.queryByText('large.pdf')).not.toBeInTheDocument();
    });
  });

  it('validates file type', async () => {
    render(<FileUpload {...defaultProps} allowedTypes={['image/*']} />);
    
    const invalidFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Browse Files');
    
    fireEvent.change(input, { target: { files: [invalidFile] } });
    
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  it('handles drag and drop', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const dropzone = screen.getByText('Drag and drop files here or').parentElement;
    
    fireEvent.dragOver(dropzone!);
    expect(dropzone).toHaveClass('dragging');
    
    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file]
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(dropzone).not.toHaveClass('dragging');
    });
  });

  it('handles file upload success', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ urls: ['https://example.com/test.pdf'] })
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    
    render(<FileUpload {...defaultProps} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Browse Files');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Upload Files')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Upload Files'));
    
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith([file]);
      expect(setItem).toHaveBeenCalledWith('uploadedFiles', {
        urls: ['https://example.com/test.pdf'],
        timestamp: expect.any(String)
      });
    });
  });

  it('handles file upload failure', async () => {
    const mockError = new Error('Upload failed');
    global.fetch = jest.fn().mockRejectedValue(mockError);
    
    render(<FileUpload {...defaultProps} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Browse Files');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Upload Files')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Upload Files'));
    
    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith('Upload failed');
    });
  });

  it('supports multiple file selection when enabled', async () => {
    render(<FileUpload {...defaultProps} multiple={true} />);
    
    const files = [
      new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['test2'], 'test2.pdf', { type: 'application/pdf' })
    ];
    const input = screen.getByLabelText('Browse Files');
    
    fireEvent.change(input, { target: { files } });
    
    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
      expect(screen.getByText('test2.pdf')).toBeInTheDocument();
    });
  });

  it('allows removing selected files', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Browse Files');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Remove'));
    
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });
});