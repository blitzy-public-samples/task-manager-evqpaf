/**
 * API Constants and Utilities
 * 
 * Requirements Addressed:
 * - API Design (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Provides centralized constants for API configurations to ensure consistency and maintainability.
 * 
 * Human Tasks:
 * - Verify the BASE_API_URL matches the deployed API environment
 * - Ensure CORS is properly configured on the API server to accept requests from the web client
 * - Configure appropriate request timeouts based on production performance requirements
 */

// Base URL for all API requests
export const BASE_API_URL = 'https://api.taskmanagement.com/v1';

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 30000;

// Default headers for all API requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// HTTP status codes for error handling
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Custom error class for API requests
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Makes an API request to the specified endpoint with the given options.
 * 
 * @param endpoint - The API endpoint to call (without the base URL)
 * @param options - Request options including method, headers, and body
 * @returns Promise resolving to the API response
 * @throws ApiError if the request fails
 */
export async function makeApiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    // Construct the full URL
    const url = `${BASE_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Merge default headers with provided headers
    const headers = {
      ...DEFAULT_HEADERS,
      ...options.headers
    };

    // Set up request options with defaults
    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Include cookies for authentication
      signal: AbortSignal.timeout(options.signal ? undefined : DEFAULT_TIMEOUT)
    };

    // Make the request
    const response = await fetch(url, requestOptions);

    // Parse the response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle unsuccessful responses
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || response.statusText,
        data
      );
    }

    return data;
  } catch (error) {
    // Handle fetch errors and timeouts
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError(
          0,
          'Request timeout exceeded',
          { originalError: error }
        );
      }

      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Network error occurred',
        { originalError: error }
      );
    }

    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      { originalError: error }
    );
  }
}