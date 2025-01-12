/* eslint-disable quotes */
import axios from "axios";

const geminiApiKey = "YOUR_API_KEY_HERE"; // Replace with your Gemini API key
const geminiApiUrl = "https://api.gemini.com/v1/explanations"; // Replace with the correct Gemini endpoint

/**
 * Fetch explanation for a baseball term using Gemini API.
 * @param {string} term - The term to be explained.
 * @returns {Promise<string>} - The explanation returned by the Gemini API.
 */
export const fetchExplanationFromGemini = async (term) => {
  try {
    const response = await axios.post(
      geminiApiUrl,
      {
        query: term,
      },
      {
        headers: {
          Authorization: `Bearer ${geminiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Assuming the explanation is returned in `response.data.explanation`
    return response.data.explanation;
  } catch (error) {
    console.error("Error fetching explanation from Gemini:", error);
    throw new Error("Failed to fetch explanation.");
  }
};
