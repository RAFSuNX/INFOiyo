export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH_INVALID_EMAIL: 'Please enter a valid email address',
  AUTH_WEAK_PASSWORD: 'Password must be at least 8 characters long',
  AUTH_EMAIL_IN_USE: 'This email is already in use',
  AUTH_WRONG_PASSWORD: 'Incorrect email or password',
  AUTH_USER_NOT_FOUND: 'No account found with this email',
  AUTH_TOO_MANY_REQUESTS: 'Too many attempts. Please try again later',
  USERNAME_TAKEN: 'Username is already taken',
  USERNAME_INVALID: 'Username can only contain letters, numbers, and underscores',
  USERNAME_TOO_SHORT: 'Username must be at least 3 characters long',
  USERNAME_TOO_LONG: 'Username must be less than 20 characters',
  
  // Post errors
  POST_NOT_FOUND: 'The requested post could not be found',
  POST_TITLE_REQUIRED: 'Post title is required',
  POST_CONTENT_REQUIRED: 'Post content is required',
  POST_CREATE_FAILED: 'Failed to create post. Please try again',
  POST_UPDATE_FAILED: 'Failed to update post. Please try again',
  POST_DELETE_FAILED: 'Failed to delete post. Please try again',
  
  // Comment errors
  COMMENT_TOO_LONG: 'Comment must be less than 1000 characters',
  COMMENT_EMPTY: 'Comment cannot be empty',
  COMMENT_FAILED: 'Failed to post comment. Please try again',
  
  // Image errors
  IMAGE_INVALID_URL: 'Please enter a valid image URL',
  IMAGE_LOAD_FAILED: 'Failed to load image. Please check the URL',
  IMAGE_UPLOAD_FAILED: 'Failed to upload image. Please try again',
  
  // Permission errors
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again',
  SERVER_ERROR: 'Server error. Please try again later',
  VALIDATION_ERROR: 'Please check your input and try again',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment',
  
  // Form validation
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_FORMAT: (field: string) => `Invalid ${field.toLowerCase()} format`,
  TOO_LONG: (field: string, max: number) => `${field} must be less than ${max} characters`,
  TOO_SHORT: (field: string, min: number) => `${field} must be at least ${min} characters`
};