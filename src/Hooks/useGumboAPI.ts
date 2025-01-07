import { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces
interface Team {
  name: string;
  logo: string;
  record: string;
  pitcher: string;
  era: string;
}

interface Weather {
  condition: string;
  wind: string;
  temp: string;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface Tip {
  text: string;
}

// Hook Return Type
interface GumboAPIResponse {
  teamA: Team | null;
  teamB: Team | null;
  weather: Weather | null;
  glossary: GlossaryTerm[];
  questions: Question[];
  tips: Tip[];
  loading: boolean;
  error: string | null;
}

// Custom Hook
export const useGumboAPI = (gameId: string): GumboAPIResponse => {
  // State Variables
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Game Data for Predictions
        const gameResponse = await axios.get(
          `https://api.gumbo-baseball.com/game/${gameId}` // Replace with actual endpoint
        );
        const gameData = gameResponse.data;

        // Set Team and Weather Data
        setTeamA(gameData.teamA);
        setTeamB(gameData.teamB);
        setWeather(gameData.weather);

        // Fetch Glossary Data
        const glossaryResponse = await axios.get(
          'https://api.gumbo-baseball.com/glossary' // Replace with actual endpoint
        );
        setGlossary(glossaryResponse.data.terms);

        // Fetch Quiz Questions
        const quizResponse = await axios.get(
          'https://api.gumbo-baseball.com/quiz' // Replace with actual endpoint
        );
        setQuestions(quizResponse.data.questions);

        // Fetch Prediction Tips
        const tipsResponse = await axios.get(
          `https://api.gumbo-baseball.com/tips/${gameId}` // Replace with actual endpoint
        );
        setTips(tipsResponse.data.tips);

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameId]);

  return {
    teamA,
    teamB,
    weather,
    glossary,
    questions,
    tips,
    loading,
    error,
  };
};