/**
 * Ranger App – Error Domain
 *
 * Custom error types used throughout the app for consistent error handling.
 */

/**
 * Base application error.
 */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message, code) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

/**
 * Validation error with field-level messages.
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message
   * @param {Record<string, string>} fieldErrors – field -> message map
   */
  constructor(message, fieldErrors = {}) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Storage operation error.
 */
export class StorageError extends AppError {
  /**
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message, cause) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
    this.cause = cause;
  }
}

/**
 * Network / connectivity error.
 */
export class NetworkError extends AppError {
  /**
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message, cause) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

export default {
  AppError,
  ValidationError,
  StorageError,
  NetworkError,
};
