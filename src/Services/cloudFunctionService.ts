import axios from 'axios';

// Base URL for Cloud Function endpoints
const BASE_URL = 'https://<your-cloud-function-url>'; // Replace with your deployed Cloud Function URL

// Fetch Predictions for a Given Game
export const fetchPredictions = async (gameId: string): Promise<string[]> => {
  try {
    const response = await axios.post(`${BASE_URL}/fetchPredictions`, { gameId });
    return response.data.predictions; // Assuming predictions array is returned
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw new Error('Failed to fetch predictions');
  }
};

// Fetch Quiz Hints for a Given Question
export const fetchQuizHints = async (question: string): Promise<string[]> => {
  try {
    const response = await axios.post(`${BASE_URL}/fetchQuizHints`, { question });
    return response.data.hints; // Assuming hints array is returned
  } catch (error) {
    console.error('Error fetching quiz hints:', error);
    throw new Error('Failed to fetch quiz hints');
  }
};

// Fetch Trading Card Details Based on Earned Points
export const fetchTradingCard = async (cardId: string): Promise<{ name: string; image: string }> => {
  try {
    const response = await axios.get(`${BASE_URL}/fetchTradingCard`, {
      params: { cardId },
    });
    return response.data; // Assuming { name, image } structure
  } catch (error) {
    console.error('Error fetching trading card:', error);
    throw new Error('Failed to fetch trading card');
  }
};

// Redeem Trading Card for Points
export const redeemTradingCard = async (points: number): Promise<{ cardId: string; name: string; image: string }> => {
  try {
    const response = await axios.post(`${BASE_URL}/redeemTradingCard`, { points });
    return response.data; // Assuming card details { cardId, name, image }
  } catch (error) {
    console.error('Error redeeming trading card:', error);
    throw new Error('Failed to redeem trading card');
  }
};