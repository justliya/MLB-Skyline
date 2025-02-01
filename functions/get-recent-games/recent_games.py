import datetime
import os
import requests
import logging
import json
from google.cloud import bigquery
from flask import Flask, jsonify, Response, request

app = Flask(__name__)

bq_client = bigquery.Client()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_last_10_games():
    """
    Query the BigQuery table for the last 10 baseball games and fetches the game ID from the stats API.

    Returns:
        List of dictionaries containing gid, visteam, hometeam, and statsapi_game_pk.
    """

    dataset = os.environ.get("BIGQUERY_DATASET")
    table = os.environ.get("BIGQUERY_TABLE")

    current_date = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d')
    query = f"""
    SELECT gid, visteam, hometeam, date
    FROM `{dataset}.{table}`
    WHERE CAST(date AS STRING) <= '{current_date}'
    AND gametype = '{game_type}'
    ORDER BY date DESC
    LIMIT 15
    """
    query_job = bq_client.query(query, job_config=bigquery.QueryJobConfig(use_query_cache=True))
    results = query_job.result()

    games = []
    for row in results:
        bigquery_game = {"gid": row["gid"], "visteam": row["visteam"], "hometeam": row["hometeam"]}
        api_game_pk = get_statsapi_game_pk(str(row['date']), row["visteam"], row["hometeam"])
        games.append({**bigquery_game, "statsapi_game_pk": api_game_pk})

    return games

def get_statsapi_game_pk(game_date, team1, team2):
    """
    Fetches gamePk from the MLB Stats API using team names and date.

    Args:
        game_date (str): The date of the game.
        team1 (str):  Team 1 from the big query result.
        team2 (str): Team 2 from the big query result.

    Returns:
        int or None: The gamePk if found, None otherwise.
    """
    date_str = f"{game_date[:4]}-{game_date[4:6]}-{game_date[6:]}"
    team1_id = get_team_id(team1)
    team2_id = get_team_id(team2)

    # Extract the season from the game date
    season = int(game_date[:4])

    if not team1_id or not team2_id:
        logger.warning(f"Team ID not found for team1: {team1}, team2: {team2}")
        return None

    url = f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&season={season}&date={date_str}"
    try:
        response = requests.get(url)
        response.raise_for_status() 
        data = response.json() 
        if data['totalGames'] > 0:
            for game in data['dates'][0]['games']:
                if (game['teams']['away']['team']['id'] == team1_id and game['teams']['home']['team']['id'] == team2_id) or (game['teams']['away']['team']['id'] == team2_id and game['teams']['home']['team']['id'] == team1_id):
                    return [ game['gamePk'],  { f"{team1}": team1_id, f"{team2}": team2_id } ]

        logger.info(f"No matching game found for date: {date_str}, team1: {team1_id}: {team2_id}")
        return None

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching gamePk from Stats API: {e}")
        return None

def get_team_id(team_abbrev):
    """
    Maps team abbreviation to team id.

    Returns:
        int or None: The teamId if found, None otherwise.
    """

    # American League AND National League
    # TODO  Add the league to the team_map
    team_map = {
        "ANA": 108,
        "ARI": 109,
        "BAL": 110,
        "BOS": 111,
        "CHN": 112,
        "CHA": 145,
        "CIN": 113,
        "CLE": 114,
        "COL": 115,
        "DET": 116,
        "HOU": 117,
        "KCA": 118,
        "LAN": 119,
        "WAS": 120,
        "NYN": 121, 
        "MIN": 142,
        "PHI": 143,
        "ATL": 144,
        "CHA": 145,
        "MIA": 146,
        "NYA": 147,
        "MIL": 158,
        "ATH": 133,
        "PIT": 134,
        "SDN": 135,
        "SEA": 136,
        "SFN": 137,
        "SLN": 138,
        "TBA": 139,
        "TEX": 140,
        "TOR": 141
    }

    return team_map.get(team_abbrev)

@app.route('/recent-games', methods=['GET'])
def get_last_10_games():
    """
    Flask route to fetch the last 10 baseball games and return them as a JSON response.

    Query Parameters:
        game_type (str): The type of games to fetch (e.g., "regular", "postseason").

    Returns:
        JSON response containing the last 10 games with their Stats API gamePk.
    """
    game_type = request.args.get('game_type', 'regular')
    try:
        games = fetch_last_10_games(game_type=game_type)
        return Response(json.dumps(games, indent=4), mimetype='application/json'), 200
    except Exception as e:
        return Response(json.dumps({"error": str(e)}, indent=4), mimetype='application/json'), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))