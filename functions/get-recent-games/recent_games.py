import datetime
import os
from google.cloud import bigquery 
from firebase_functions import https

bq_client = bigquery.Client()

def fetch_last_10_games():
    """
    Query the BigQuery table for the last 10 baseball games based on the current date.

    Returns:
        List of dictionaries containing gid, pitteam, and batteam.
    """

    dataset = os.environ.get("BIGQUERY_DATASET")
    table = os.environ.get("BIGQUERY_PLAY_TABLE")
    
    current_date = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d')
    query = f"""
    SELECT gid, pitteam, batteam
    FROM `{dataset}.{table}`
    WHERE date <= '{current_date}'
    ORDER BY date DESC
    LIMIT 10
    """
    query_job = bq_client.query(query)
    results = query_job.result()

    games = [
        {"gid": row["gid"], "pitteam": row["pitteam"], "batteam": row["batteam"]}
        for row in results
    ]

    return games

@https.on_request
def get_last_10_games(request):
    """
    Firebase HTTPS function to fetch the last 10 baseball games and return them as a JSON response.

    Args:
        request: HTTP request object.

    Returns:
        JSON response containing the last 10 games.
    """
    try:
        games = fetch_last_10_games()
        return https.Response(games, status=200)
    except Exception as e:
        return https.Response({"error": str(e)}, status=500)
