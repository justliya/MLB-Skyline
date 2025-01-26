import React, { useEffect } from 'react';

const RecentGames = () => {
  const { games, setGames } = useAppContext();

  useEffect(() => {
    const fetchGames = async () => {
      const response = await fetch(
        'https://get-recent-games-114778801742.us-central1.run.app/getLastTenGames'
      );
      const data = await response.json();
      setGames(data);
    };

    fetchGames();
  }, [setGames]);

  if (!games) {
    return <p>Loading games...</p>;
  }

  return (
    <ul>
      {games.map((game) => (
        <li key={game.gid}>
          {game.batteam} vs. {game.pitteam} (Game ID: {game.gid})
        </li>
      ))}
    </ul>
  );
};

export default RecentGames;
