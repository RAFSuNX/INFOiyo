import { FirebaseError } from 'firebase/app';
import { ERROR_MESSAGES } from './errorMessages';

export function handleFirebaseError(error: FirebaseError): string {
  switch (error.code) {
    case 'auth/invalid-email':
      return ERROR_MESSAGES.AUTH_INVALID_EMAIL;
    case 'auth/weak-password':
      return ERROR_MESSAGES.AUTH_WEAK_PASSWORD;
    case 'auth/email-already-in-use':
      return ERROR_MESSAGES.AUTH_EMAIL_IN_USE;
    case 'auth/wrong-password':
      return ERROR_MESSAGES.AUTH_WRONG_PASSWORD;
    case 'auth/user-not-found':
      return ERROR_MESSAGES.AUTH_USER_NOT_FOUND;
    case 'auth/too-many-requests':
      return ERROR_MESSAGES.AUTH_TOO_MANY_REQUESTS;
    default:
      console.error('Firebase error:', error);
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

export function handleNetworkError(error: Error): string {
  if (!navigator.onLine) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  console.error('Network error:', error);
  return ERROR_MESSAGES.SERVER_ERROR;
}

export function handleValidationError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  console.error('Validation error:', error);
  return ERROR_MESSAGES.VALIDATION_ERROR;
}

export function handleApiError(error: unknown): string {
  if (error instanceof FirebaseError) {
    return handleFirebaseError(error);
  }
  if (error instanceof Error) {
    if (error.name === 'NetworkError') {
      return handleNetworkError(error);
    }
    if (error.name === 'ValidationError') {
      return handleValidationError(error);
    }
  }
  console.error('API error:', error);
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}