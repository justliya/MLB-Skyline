import { BigQuery } from '@google-cloud/bigquery';

// Initialize BigQuery Client
const bigQueryClient = new BigQuery();

// Query Historical Stats
export const fetchHistoricalStats = async (playerName: string) => {
  const query = `
    SELECT
      player_name,
      team_name,
      games_played,
      home_runs,
      batting_average,
      rbi
    FROM
      \`your_project_id.your_dataset_id.player_stats\`
    WHERE
      LOWER(player_name) = LOWER(@playerName)
    LIMIT 1;
  `;

  const options = {
    query,
    params: { playerName },
  };

  try {
    const [rows] = await bigQueryClient.query(options);
    return rows; // Returns historical stats for the player
  } catch (error) {
    console.error('Error fetching historical stats:', error);
    throw new Error('Failed to fetch historical stats.');
  }
};

// Query Team Performance
export const fetchTeamPerformance = async (teamName: string) => {
  const query = `
    SELECT
      team_name,
      wins,
      losses,
      win_percentage,
      era
    FROM
      \`your_project_id.your_dataset_id.team_performance\`
    WHERE
      LOWER(team_name) = LOWER(@teamName)
    LIMIT 1;
  `;

  const options = {
    query,
    params: { teamName },
  };

  try {
    const [rows] = await bigQueryClient.query(options);
    return rows; // Returns team performance data
  } catch (error) {
    console.error('Error fetching team performance:', error);
    throw new Error('Failed to fetch team performance.');
  }
};

// Query Player Trends for Predictions
export const fetchPlayerTrends = async (playerName: string) => {
  const query = `
    SELECT
      player_name,
      AVG(home_runs) AS avg_home_runs,
      AVG(rbi) AS avg_rbi,
      AVG(batting_average) AS avg_batting_avg
    FROM
      \`your_project_id.your_dataset_id.player_trends\`
    WHERE
      LOWER(player_name) = LOWER(@playerName)
    GROUP BY
      player_name
    LIMIT 1;
  `;

  const options = {
    query,
    params: { playerName },
  };

  try {
    const [rows] = await bigQueryClient.query(options);
    return rows; // Returns average trends for the player
  } catch (error) {
    console.error('Error fetching player trends:', error);
    throw new Error('Failed to fetch player trends.');
  }
};

// Query Predictions Based on Trends
export const fetchPredictionsFromTrends = async (teamName: string) => {
  const query = `
    SELECT
      team_name,
      prediction_type,
      prediction_value
    FROM
      \`your_project_id.your_dataset_id.predictions\`
    WHERE
      LOWER(team_name) = LOWER(@teamName)
    LIMIT 10;
  `;

  const options = {
    query,
    params: { teamName },
  };

  try {
    const [rows] = await bigQueryClient.query(options);
    return rows; // Returns predictions for the team
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw new Error('Failed to fetch predictions.');
  }
};