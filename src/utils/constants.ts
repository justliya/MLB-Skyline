import axios from 'axios';

// ==============================
// API Endpoints
// ==============================
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.gumbo-baseball.com/', // Replace with your base URL
  PREDICTIONS: '/predictions',
  WEATHER: 'https://api.weatherapi.com/v1/current.json',
  FIREBASE_MESSAGES: '/messages',
  QUIZ: '/quiz',
  TRADES: '/trades',
};

// ==============================
// Axios Configuration
// ==============================
export const axiosInstance = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL, // Set the base URL for all API calls
  timeout: 10000, // Request timeout in milliseconds (10 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==============================
// Default Values
// ==============================
export const DEFAULT_TEAM = {
  name: 'Team',
  logo: '',
  record: '0-0',
  pitcher: 'Unknown',
  era: '0.00',
};

export const DEFAULT_WEATHER = {
  condition: 'Unknown',
  wind: '0 mph',
  temp: 'N/A',
};

// ==============================
// ML Model Configurations
// ==============================
export const ML_MODEL = {
  MAX_HINTS: 3, // Maximum number of hints
  TIMEOUT: 5000, // Timeout in milliseconds
};

// ==============================
// Error Messages
// ==============================
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch data. Please try again later.',
  PREDICTION_FAILED: 'Failed to fetch predictions.',
  INVALID_INPUT: 'Invalid input. Please check your entries.',
  SERVER_ERROR: 'An error occurred on the server.',
};

// ==============================
// Success Messages
// ==============================
export const SUCCESS_MESSAGES = {
  SUBMISSION_SUCCESS: 'Prediction Submitted Successfully!',
  TRADE_SUCCESS: 'Trade Offer Submitted!',
  CARD_EARNED: 'You have earned a new trading card!',
};

// ==============================
// Firebase Collections
// ==============================
export const FIREBASE_COLLECTIONS = {
  MESSAGES: 'messages',
  TRADES: 'trades',
  USERS: 'users',
};

// ==============================
// Default User Configuration
// ==============================
export const DEFAULT_USER = {
  name: 'Player1',
  id: 'default-user-id',
};

// ==============================
// Points and Rewards System
// ==============================
export const POINTS = {
  CORRECT_ANSWER: 10,
  TRADE_BONUS: 5,
  REWARD_THRESHOLD: 20, // Points required to earn a trading card
};

// ==============================
// Team Logos (Example URLs)
// ==============================
export const TEAM_LOGOS = {
  YANKEES: 'https://example.com/yankees-logo.png',
  RED_SOX: 'https://example.com/redsox-logo.png',
};

// ==============================
// Weather API Configuration
// ==============================
export const WEATHER = {
  API_KEY: 'your-weather-api-key-here', // Replace with your weather API key
  BASE_URL: 'https://api.weatherapi.com/v1/current.json',
};

// ==============================
// Game Configurations
// ==============================
export const GAME = {
  MAX_INNINGS: 9,
  EXTRA_INNINGS: true,
};

// ==============================
// Timeout Configurations
// ==============================
export const TIMEOUTS = {
  FETCH_TIMEOUT: 10000, // 10 seconds
};

// ==============================
// Debug Mode
// ==============================
export const DEBUG = {
  ENABLED: true,
};