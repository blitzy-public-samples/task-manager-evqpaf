/**
 * API Utility Functions
 * 
 * Requirements Addressed:
 * - API Design (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Ensures consistent and reusable API interactions by providing utility functions 
 *   for requests, responses, and error handling.
 * 
 * Human Tasks:
 * - Verify error logging configuration for production environment
 * - Ensure appropriate error tracking/monitoring service is configured
 * - Review and adjust request timeout settings based on API performance metrics
 */

// axios v1.4.0
import axios, { AxiosError, AxiosResponse } from 'axios';
import { BASE_API_URL } from '../constants/api.constants';
import { validateEmail, validatePassword } from './validation.utils';

// Custom type definitions for API interactions
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, string>;
  timeout?: number;
  validateAuth?: boolean;
}

interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

class ApiRequestError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Makes an API request to the specified endpoint with the given options.
 * Handles request configuration, authentication, and error processing.
 * 
 * @param endpoint - The API endpoint to call (without the base URL)
 * @param options - Request configuration options
 * @returns Promise resolving to the API response data
 * @throws ApiRequestError if the request fails
 */
export async function makeApiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<any> {
  try {
    // Ensure endpoint is properly formatted
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_API_URL}${normalizedEndpoint}`;

    // Set up default request configuration
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Merge default and custom headers
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    // Configure request options
    const requestConfig = {
      url,
      method: options.method || 'GET',
      headers,
      data: options.data,
      params: options.params,
      timeout: options.timeout || 30000, // Default 30 second timeout
      validateStatus: (status: number) => status < 500, // Allow handling of 4xx errors
    };

    // Validate auth-related requests if needed
    if (options.validateAuth && options.data) {
      if (options.data.email && !validateEmail(options.data.email)) {
        throw new ApiRequestError(400, 'Invalid email format');
      }
      if (options.data.password && !validatePassword(options.data.password)) {
        throw new ApiRequestError(400, 'Invalid password format');
      }
    }

    // Make the request
    const response = await axios(requestConfig);
    return handleApiResponse(response);

  } catch (error) {
    handleApiError(error);
    throw error; // Re-throw after handling
  }
}

/**
 * Processes the API response and extracts the necessary data.
 * Handles different response formats and error conditions.
 * 
 * @param response - The axios response object
 * @returns The processed response data
 * @throws ApiRequestError if the response indicates an error
 */
export function handleApiResponse(response: AxiosResponse): any {
  // Check for successful response
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }

  // Handle client errors (4xx)
  if (response.status >= 400 && response.status < 500) {
    const errorResponse = response.data as ApiErrorResponse;
    throw new ApiRequestError(
      response.status,
      errorResponse.message || 'Client request error',
      errorResponse.details
    );
  }

  // Handle server errors (5xx)
  throw new ApiRequestError(
    response.status,
    'Server error occurred',
    response.data
  );
}

/**
 * Handles errors that occur during API requests.
 * Processes different types of errors and provides appropriate error messages.
 * 
 * @param error - The error object to handle
 * @throws ApiRequestError with processed error information
 */
export function handleApiError(error: unknown): void {
  // Handle axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Handle network errors
    if (!axiosError.response) {
      throw new ApiRequestError(
        0,
        'Network error - please check your connection',
        { originalError: axiosError.message }
      );
    }

    // Handle timeout errors
    if (axiosError.code === 'ECONNABORTED') {
      throw new ApiRequestError(
        408,
        'Request timeout - please try again',
        { originalError: axiosError.message }
      );
    }

    // Handle API response errors
    const status = axiosError.response.status;
    const errorData = axiosError.response.data;

    throw new ApiRequestError(
      status,
      errorData?.message || 'An error occurred during the request',
      errorData?.details
    );
  }

  // Handle other types of errors
  if (error instanceof Error) {
    throw new ApiRequestError(
      500,
      'An unexpected error occurred',
      { originalError: error.message }
    );
  }

  // Handle unknown errors
  throw new ApiRequestError(
    500,
    'An unknown error occurred',
    { originalError: error }
  );
}