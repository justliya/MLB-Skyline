import datetime
import os
from google.cloud import bigquery
from flask import Flask, jsonify

app = Flask(__name__)

bq_client = bigquery.Client()

def fetch_last_10_games():
    """
    Query the BigQuery table for the last 10 baseball games based on the current date.

    Returns:
        List of dictionaries containing gid, pitteam, and batteam.
    """

    dataset = os.environ.get("BIGQUERY_DATASET")
    table = os.environ.get("BIGQUERY_TABLE")
    
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

@app.route('/getLastTenGames', methods=['GET'])
def get_last_10_games():
    """
    Flask route to fetch the last 10 baseball games and return them as a JSON response.

    Returns:
        JSON response containing the last 10 games.
    """
    try:
        games = fetch_last_10_games()
        return jsonify(games), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
