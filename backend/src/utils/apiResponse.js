/**
 * Formats a successful API response.
 * @param {Object} data - The payload to return.
 * @param {String} message - An optional success message.
 * @returns {Object} Standardized success response object.
 */
export const successResponse = (data = null, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Formats an error API response.
 * @param {String} message - The error message.
 * @param {Object} data - Optional error details or metadata.
 * @returns {Object} Standardized error response object.
 */
export const errorResponse = (message = 'An error occurred', data = null) => {
  return {
    success: false,
    message,
    ...(data && { data })
  };
};
