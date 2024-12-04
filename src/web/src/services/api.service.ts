/**
 * API Service
 * 
 * Requirements Addressed:
 * - API Design (Technical Specification/3.3 API Design/3.3.1 API Architecture)
 *   Ensures consistent and reusable API interactions by providing a centralized 
 *   service for API requests and error handling.
 * 
 * Human Tasks:
 * - Verify error handling meets production logging requirements
 * - Ensure appropriate request timeouts are configured for production use
 * - Configure monitoring for API request failures and performance
 */

// axios v1.4.0
import { BASE_API_URL } from '../constants/api.constants';
import { 
  makeApiRequest, 
  handleApiResponse, 
  handleApiError 
} from '../utils/api.utils';
import { getApiConfig } from '../config/api.config';

/**
 * Fetches data from the specified API endpoint using the provided options.
 * 
 * @param endpoint - The API endpoint to call (without the base URL)
 * @param options - Request configuration options
 * @returns Promise resolving to the API response data
 */
export async function fetchData(endpoint: string, options: {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
  validateAuth?: boolean;
} = {}): Promise<any> {
  try {
    // Get API configuration
    const apiConfig = getApiConfig();

    // Ensure endpoint is properly formatted
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Set up request options with defaults from config
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        ...apiConfig.defaultHeaders,
        ...options.headers
      },
      timeout: options.timeout || apiConfig.timeout,
      params: options.params,
      validateAuth: options.validateAuth
    };

    // Make the API request
    const response = await makeApiRequest(normalizedEndpoint, requestOptions);
    
    // Process the response
    return handleApiResponse(response);
  } catch (error) {
    // Handle any errors that occur during the request
    handleApiError(error);
    throw error; // Re-throw to allow calling code to handle errors
  }
}

/**
 * Sends data to the specified API endpoint using the POST method.
 * 
 * @param endpoint - The API endpoint to call (without the base URL)
 * @param data - The data to send in the request body
 * @returns Promise resolving to the API response data
 */
export async function postData(endpoint: string, data: any): Promise<any> {
  try {
    // Get API configuration
    const apiConfig = getApiConfig();

    // Ensure endpoint is properly formatted
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Set up request options
    const requestOptions = {
      method: 'POST' as const,
      headers: {
        ...apiConfig.defaultHeaders
      },
      timeout: apiConfig.timeout,
      data
    };

    // Make the API request
    const response = await makeApiRequest(normalizedEndpoint, requestOptions);
    
    // Process the response
    return handleApiResponse(response);
  } catch (error) {
    // Handle any errors that occur during the request
    handleApiError(error);
    throw error; // Re-throw to allow calling code to handle errors
  }
}