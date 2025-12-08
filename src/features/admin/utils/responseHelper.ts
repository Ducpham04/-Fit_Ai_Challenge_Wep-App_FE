/**
 * Helper functions to normalize BE response formats
 */

/**
 * Extract data from various BE response formats:
 * - Page format: { content: [], totalElements, totalPages, ... }
 * - NotificationResponse: { success, message, data: [] }
 * - Direct array: []
 */
export function extractDataFromResponse<T>(response: any): T[] {
  // Handle Page format (Spring Data)
  if (response?.data?.content && Array.isArray(response.data.content)) {
    return response.data.content as T[];
  }
  
  // Handle NotificationResponse format
  if (response?.data?.data && Array.isArray(response.data.data)) {
    return response.data.data as T[];
  }
  
  // Handle direct array
  if (Array.isArray(response?.data)) {
    return response.data as T[];
  }
  
  // Handle direct response (if data is already an array)
  if (Array.isArray(response)) {
    return response as T[];
  }
  
  // Fallback: return empty array
  console.warn('Could not extract data from response:', response);
  return [];
}

/**
 * Extract single item from response
 */
export function extractItemFromResponse<T>(response: any): T | null {
  // Handle NotificationResponse with data object
  if (response?.data?.data && typeof response.data.data === 'object') {
    return response.data.data as T;
  }
  
  // Handle direct data object
  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return response.data as T;
  }
  
  // Handle direct response
  if (response && typeof response === 'object' && !Array.isArray(response)) {
    return response as T;
  }
  
  return null;
}

/**
 * Check if response is successful
 */
export function isResponseSuccess(response: any): boolean {
  if (response?.data?.success !== undefined) {
    return response.data.success;
  }
  
  // If no success field, assume success if data exists
  return response?.data !== undefined && response?.data !== null;
}

/**
 * Get error message from response
 */
export function getErrorMessage(response: any, defaultMessage: string = 'An error occurred'): string {
  if (response?.data?.message) {
    return response.data.message;
  }
  
  if (response?.message) {
    return response.message;
  }
  
  if (response?.response?.data?.message) {
    return response.response.data.message;
  }
  
  return defaultMessage;
}



