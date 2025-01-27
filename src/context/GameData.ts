import { useEffect } from 'react';
import { useAppContext } from './GameContext';

const RecentGamesFetcher = () => {
  const { setGames } = useAppContext();

  useEffect(() => {
    const fetchGames = async () => {
      const response = await fetch(
        'https://get-recent-games-114778801742.us-central1.run.app/getLastTenGames'
      );
      const data = await response.json();

      setGames(data); // Store the fetched games in context
    };

    fetchGames();
  }, [setGames]);

  return null;
};