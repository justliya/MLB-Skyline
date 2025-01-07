import { Alert } from 'react-native';
import { POINTS, ERROR_MESSAGES } from  './constants';


// ==============================
// Formatting Helpers
// ==============================

// Format Date to Readable String
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

// Format Time from Timestamp
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Capitalize First Letter of Each Word
export const capitalizeWords = (text: string): string => {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

// ==============================
// Validation Helpers
// ==============================

// Validate Email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate Points
export const isValidPoints = (points: number): boolean => {
  return points >= 0;
};

// ==============================
// Points Helpers
// ==============================

// Calculate Total Points Earned
export const calculateTotalPoints = (
  correctAnswers: number,
  bonusTrades: number
): number => {
  return correctAnswers * POINTS.CORRECT_ANSWER + bonusTrades * POINTS.TRADE_BONUS;
};

// Check if User Earned Trading Card
export const earnedTradingCard = (points: number): boolean => {
  return points >= POINTS.REWARD_THRESHOLD;
};

// ==============================
// Error Handling Helpers
// ==============================

// Show Error Alert
export const showError = (error: string) => {
  Alert.alert('Error', error || ERROR_MESSAGES.SERVER_ERROR);
};

// Show Success Alert
export const showSuccess = (message: string) => {
  Alert.alert('Success', message);
};

// Handle API Errors
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with a status other than 2xx
    return error.response.data.message || ERROR_MESSAGES.FETCH_FAILED;
  } else if (error.request) {
    // No response received from the server
    return ERROR_MESSAGES.FETCH_FAILED;
  } else {
    // Error setting up the request
    return ERROR_MESSAGES.SERVER_ERROR;
  }
};

// ==============================
// String Helpers
// ==============================

// Truncate Text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

// Highlight Search Term in Text
export const highlightText = (text: string, term: string): string => {
  if (!term) return text;
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<b>$1</b>');
};

// ==============================
// General Helpers
// ==============================

// Generate Random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Convert Boolean to Yes/No
export const booleanToYesNo = (value: boolean): string => {
  return value ? 'Yes' : 'No';
};

// Delay Execution (Simulates Async Delay)
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ==============================
// API Response Formatting
// ==============================

// Format Prediction Response
export const formatPredictionResponse = (predictions: any[]): string[] => {
  return predictions.map((prediction, index) => `Prediction ${index + 1}: ${prediction}`);
};

// ==============================
// Logging Helpers (Debug Mode)
// ==============================

// Debug Logger
export const debugLog = (message: string, data?: any) => {
  console.log(`[DEBUG] ${message}`, data || '');
};