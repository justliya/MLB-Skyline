import os
import time
import datetime
import traceback
import logging
import json
import requests
from flask import Flask, jsonify, Response, request, stream_with_context
from google.cloud import bigquery, firestore, aiplatform
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting
from google.protobuf.json_format import ParseDict
from google.protobuf.struct_pb2 import Value
from prompts import PITCH_PREDICTION_PROMPT

app = Flask(__name__)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 300

project_id = os.environ["PROJECT_ID"]
project_name = os.environ["PROJECT_NAME"]
db_name = os.environ["DEFAULT_DATABASE"]
bq_client = bigquery.Client()
db = firestore.Client(database=db_name)
location = "us-central1"
ai_client = aiplatform.gapic.PredictionServiceClient(client_options={"api_endpoint": f"{location}-aiplatform.googleapis.com"})

DEFAULT_TIMEOUT = 300  # 5 minutes

p_endpoint_id = os.environ.get("PITCH_PREDICTION_ENDPOINT_ID")
w_endpoint_id = os.environ.get("WIN_PREDICTION_ENDPOINT_ID")
b_endpoint_id = os.environ.get("BATTING_PREDICTION_ENDPOINT_ID")
location = "us-central1"
player_cache = {}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def save_state(user_id, state):
    db.collection("replay_states").document(user_id).set(state)

def load_state(user_id):
    doc = db.collection("replay_states").document(user_id).get()
    if doc.exists:
        return doc.to_dict()
    return {"is_paused": False, "current_play_index": 0, "last_active": datetime.datetime.now(datetime.UTC)}

@app.route('/pause', methods=['POST'])
def pause_replay():
    user_id = request.json.get("user_id")
    gid = request.json.get("gid")
    mode = request.json.get("mode")
    interval = request.json.get("interval")
    
    if not user_id or not gid or not mode or not interval:
        return jsonify({"error": "Missing 'user_id', 'gid', 'mode', or 'interval'."}), 400

    state = load_state(user_id)
    state["is_paused"] = True
    state["last_active"] = datetime.datetime.now(datetime.UTC)
    state["gid"] = gid
    state["mode"] = mode
    state["interval"] = interval
    save_state(user_id, state)

    logger.info(f"Replay paused for user {user_id}.")
    return jsonify({"message": f"Replay paused for user {user_id}."}), 200

@app.route('/resume', methods=['POST'])
def resume_replay():
    user_id = request.json.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing 'user_id'."}), 400

    state = load_state(user_id)
    if state["is_paused"]:
        state["is_paused"] = False
        state["last_active"] = datetime.datetime.now(datetime.UTC)
        save_state(user_id, state)
        logger.info(f"Replay resumed for user {user_id}.")
        return _resume_replay(user_id)
    else:
        return jsonify({"message": "Replay is already running."}), 200

@app.route('/game-replay', methods=['POST'])
def game_replay():
    """Simulate game replays and stream play-by-play summaries."""
    request_json = request.get_json()

    if not request_json or 'gid' not in request_json or 'mode' not in request_json or 'user_id' not in request_json:
        return jsonify({"error": "Invalid input. 'gid', 'mode', and 'user_id' are required."}), 400

    gid = request_json['gid']
    mode = request_json['mode']
    user_id = request_json['user_id']
    interval = request_json.get('interval', 20)

    try:
        # Initialize state
        state = load_state(user_id)
        state["gid"] = gid
        state["mode"] = mode
        state["interval"] = interval
        if state["last_active"] is None:
            state["last_active"] = datetime.datetime.now(datetime.UTC)
        save_state(user_id, state)

        plays = fetch_plays(gid)
        
        return Response(stream_replay(user_id, plays, mode, interval), content_type="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        })
    except Exception as e:
        error_message = str(e)
        stack_trace = traceback.format_exc()
        line_number = stack_trace.splitlines()[-3]
        return jsonify({"error": error_message, "stack_trace": stack_trace, "line_number": line_number}), 500

@app.route('/games', methods=['GET'])
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

@app.route('/predict-pitch', methods=['POST'])
def predict_pitch():
    """Predict the next pitch type for a given game and pitcher."""
    user_id = request.json.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing 'user_id'."}), 400

    try:
        state = load_state(user_id)
        gid = state.get("gid")
        interval = state.get("interval")
        current_index = state.get("current_play_index", 0)

        if not gid or not interval:
            return jsonify({"error": "Missing 'gid' or 'interval' in state."}), 400

        plays = fetch_plays(gid)

        for index, play in plays.iterrows():
            if index < current_index:
                continue

            state = load_state(user_id)
            is_paused = state.get("is_paused", False)

            if is_paused:
                break

            try:
                last_pitch = play.pitches.split(",")[-1] if play.pitches else "unknown"
                features = {
                    "pitcher_team": play.pitcher_team,
                    "batter_team": play.batter_team,
                    "bathand": play.bathand,
                    "pithand": play.pithand,
                    "inning": play.inning,
                    "top_bot": play.top_bot,
                    "vis_home": play.vis_home,
                    "count": play.count,
                    "pitch_num_in_pa": play.pitch_num_in_pa,
                    "last_pitch": last_pitch
                }
                prediction = get_predictions_from_model(project_id, p_endpoint_id, features)
                prediction["pitcher_name"] = get_player_name(play["pitcher"])
                prediction["pitch_human_label"] = prompt_gemini_api(PITCH_PREDICTION_PROMPT.format(prediction["predicted_label"]))
                logger.info(f"Predicted pitch: {prediction}")
                yield f"data: {json.dumps({'prediction': prediction})}\n\n"

            except Exception as e:
                yield f"data: Error predicting pitch: {str(e)}\n\n"

            time.sleep((interval)) # Show prediction before next play

    except Exception as e:
        error_message = str(e)
        stack_trace = traceback.format_exc()
        line_number = stack_trace.splitlines()[-3]
        yield f"data: Error during prediction: {error_message}, stack_trace: {stack_trace}, line_number: {line_number}\n\n"

@app.route('/predict-win', methods=['GET'])
def predict_wins():
    """Predict win probabilities for each play."""
    gid = request.args.get("gid")
    game_pk = request.args.get("game_pk", None)
    
    if not gid:
        return jsonify({"error": "Missing 'gid' parameter."}), 400
    
    try:
        predictions = _predict_wins(gid, game_pk)
        return jsonify({"predictions": predictions})
    except Exception as e:
        error_message = str(e)
        stack_trace = traceback.format_exc()
        line_number = stack_trace.splitlines()[-3]
        return jsonify({
            "error": error_message, 
            "stack_trace": stack_trace, 
            "line_number": line_number
        }), 500

def _resume_replay(user_id):
    """Internal function to resume game replays and stream play-by-play summaries."""
    try:
        state = load_state(user_id)
        gid = state.get("gid")
        mode = state.get("mode")
        interval = state.get("interval")

        if not gid or not mode or not interval:
            return jsonify({"error": "Missing 'gid', 'mode', or 'interval' in state."}), 400

        plays = fetch_plays(gid)

        return Response(stream_replay(user_id, plays, mode, interval, resume=True), content_type="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        })
    except Exception as e:
        error_message = str(e)
        stack_trace = traceback.format_exc()
        line_number = stack_trace.splitlines()[-3]
        return jsonify({"error": error_message, "stack_trace": stack_trace, "line_number": line_number}), 500

def _predict_wins(gid, game_pk):
    """Calculate win probability predictions for all plays in a game."""
    try:
        plays = fetch_plays(gid)
        predictions = []
        
        last_win_probability = None
        home_runs = 0
        away_runs = 0
        home_team = ""
        away_team = ""
        run_differential = {}

        for index, play in plays.iterrows():
            is_visting_team_play = False
            if play["vis_home"] == 1:
                home_runs += play["runs"]
                home_team = play["batteam"]
                away_team = play["pitteam"]
            else:
                away_runs += play["runs"]
                is_visting_team_play = True
                away_team = play["batteam"] 
                home_team = play["pitteam"]

            #run_differential[index] = home_runs - away_runs
            EXCLUDED_COLUMNS = {
                "gid", "batter", "ballpark", "bathand", "pithand", "pbp", 
                "rbi", "er", "run_b", "run1", "run2", "run3", "prun1", "prun2", "prun3",
                "outs_post", "br1_post", "br2_post", "br3_post", "bat_f",
                "gametype", "event_order", "vis_home", "pitcher"
            }
            features = {
                key: str(value) for key, value in play.items() if key not in EXCLUDED_COLUMNS
            }
            features["home_team_runs"] = str(home_runs)
            features["away_team_runs"] = str(away_runs)

            win_probability = get_predictions_from_model(project_id, w_endpoint_id, features)
            if win_probability is None:
                # Skip to the next play if prediction fails. 
                logger.error(f"Prediction failed for play: {win_probability}")
                continue
        
            key_play = None
            
            if last_win_probability is not None:
                probability_change = (win_probability) - (last_win_probability)
                # Only consider plays with 'significant' win probability changes
                # were using 5% as a threshold for significance since there are often small fluctuations in win probability
                # during the course of a game that are still meaningful to the outcome.
                if abs(probability_change) > 5:
                    explanation_prompt = f"""
                        Act as a baseball analyst and provide a concise explanation of the current play's 
                        impact on the win probability of the home team : {home_team} 
                        The win probability changed by {probability_change:.2f}% and the visting team is {away_team}
                        Current play: {play['event']} batter: {get_player_name(play['batter'])}, 
                        pitcher: {get_player_name(play['pitcher'])}, inning: {play['inning']}, 
                        outs: {play['outs_pre']}, bases: {get_bases_state(play)} 
                        score: {home_runs}-{away_runs}
                        Visting team play: {is_visting_team_play}
                        Limit the response to 1 and a half sentences.
                    """
                    
                    play_label_prompt = f"""
                        Act as a baseball analyst and provide a short description the following play
                        written in shorthand notation from Retrosheet
                        Current play: {play['event']}
                        Limit the response to 4 words
                    """
                    play_label = prompt_gemini_api(play_label_prompt)
                    explanation = prompt_gemini_api(explanation_prompt)
                    pbp_data = None
                    if game_pk:
                        pbp_data = fetch_game_pbp(game_pk, play)
                    else:
                        logging.warning(f"Could not fetch PBP data without game_pk")
                    key_play = {
                        "play_label": play_label,
                        "inning": play["inning"],
                        "win_probability": win_probability,
                        "probability_change": probability_change,
                        "explanation": explanation,
                        "play_id": pbp_data['playId'] if pbp_data else None  # Ensure correct key
                    }
            last_win_probability = win_probability

            data = { 
                'home_team': play['batteam'] if play['vis_home'] == 1 else play['pitteam'],
                'inning': play['inning'],
                'win_probability': win_probability, 
                'key_play': key_play
            }
            predictions.append(data)

        return predictions
    
    except Exception as e:
        error_message = str(e)
        stack_trace = traceback.format_exc()
        line_number = stack_trace.splitlines()[-3]
        logger.error(f"Error during prediction: {error_message}, stack_trace: {stack_trace}, line_number: {line_number}")  # Add logging here
        return []

def stream_replay(user_id, plays, mode, interval, resume=False):
    """Stream the replay play-by-play."""
    try:
        state = load_state(user_id) 
        current_index = state.get("current_play_index", 0)

        for index, play in plays.iterrows():
            if resume and index < current_index:
                continue

            state = load_state(user_id)
            is_paused = state.get("is_paused", False)

            if is_paused:
                state["current_play_index"] = index
                save_state(user_id, state)
                logger.info(f"Replay paused at play index {index} for user {user_id}.")
                return

            try:
                strategy = generate_play_description(play, mode)
            except Exception as e:
                strategy = f"Error generating strategy: {str(e)}"

            yield f"data: {strategy}\n\n"

            state["current_play_index"] = index + 1
            state["last_active"] = datetime.datetime.now(datetime.UTC)
            save_state(user_id, state)

            # Give the user time to read the play
            time.sleep(interval)

        state["current_play_index"] = len(plays)
        state["is_paused"] = True  # Set paused to true to indicate end of stream
        save_state(user_id, state)
        yield f"data: Replay complete.\n\n"

    except Exception as e:
        yield f"data: Error during stream: {str(e)}\n\n"

def generate_play_description(play, mode):
    """Generate a natural language explanation for the play using Gemini Gen AI."""
    try:
        batter_name = get_player_name(play['batter'])
        pitcher_name = get_player_name(play['pitcher'])
        fielder_ids = [play.get(f'f{i}') for i in range(2, 10)]
        fielder_names = [get_player_name(fielder_id) for fielder_id in fielder_ids if fielder_id]
        
        technical_prompt = f"""
            Act as a baseball analyst and provide a high-level breakdown of the strategy behind this play.
            Explain the pitch type, sequencing decisions, and how game context influences strategy.
            Analyze the batter-pitcher matchup, defensive positioning, and expected outcomes.
            Use advanced terminology, but keep the response concise (1-2 sentences), focused on tactical insights rather than just play-by-play.
            Do not include the play shorthand in the response."

            Play: {play["event"]}
            Context:
            Batter Stats:
                Batter - {batter_name},
                Bat Hand - {play["bathand"]},
                Plate Appearances - {play["pa"]},
                At-Bats - {play["ab"]},
                Hits - {play["single"] + play["double"] + play["triple"] + play["hr"]},
                Home Runs - {play["hr"]},
                RBIs - {play["rbi"]},
                Walks - {play["walk"]},
                Team - {play["batteam"]},
            Pitcher Stats:
                Pitcher - {pitcher_name},
                Pitch Hand - {play["pithand"]},
                Pitch - {play["pitches"]},
                Number of Pitches - {play["nump"]},
                Strikeouts - {play["k"]},
                Earned Runs - {play["er"]},
                Wild Pitches - {play["wp"]},
                Loss Indicator - {play["lp"]},
                pitcher Team - {play["pitteam"]},
            Fielding Stats:
                Outs Before Play - {play["outs_pre"]},
                Outs After Play - {play["outs_post"]},
                Putouts by Fielders - {play["po0"] + play["po1"] + play["po2"] + play["po3"] + play["po4"] + play["po5"] + play["po6"] + play["po7"] + play["po8"] + play["po9"]},
                Assists by Fielders - {play["a1"] + play["a2"] + play["a3"] + play["a4"] + play["a5"] + play["a6"] + play["a7"] + play["a8"] + play["a9"]},
                Errors - {play["e1"] + play["e2"] + play["e3"] + play["e4"] + play["e5"] + play["e6"] + play["e7"] + play["e8"] + play["e9"]},
                Grounded into Double Play - {play["gdp"]},
                Triple Play - {play["tp"]},
                Ball in Play Indicator - {play["bip"]},
                Fielders - {', '.join(fielder_names)}
        """
        casual_prompt = f"""
            "Act as a baseball analyst and provide real-time insights into the strategy behind each play.
            Explain the action clearly and concisely for casual fans.
            Focus on why the play matters and what strategic decisions were involved.
            Provide insight into offensive and defensive tactics, such as pitch selection, base running, or field positioning.
            Keep the response engaging but limited to 1-2 sentences.
            Do not include the play shorthand in the response.
            
            Play: {play["event"]}
            Context:
            Batter:
                Name - {batter_name},
                Hits - {play["single"] + play["double"] + play["triple"] + play["hr"]},
                Home Runs - {play["hr"]},
                Team - {play["batteam"]},
            Pitcher:
                Name - {pitcher_name},
                Pitch - {play["pitches"]},
                Strikeouts - {play["k"]},
                Earned Runs Allowed - {play["er"]},
                Team - {play["pitteam"]},
            Fielding:
                Outs Made - {play["outs_post"] - play["outs_pre"]},
                Errors on This Play - {play["e1"] + play["e2"] + play["e3"] + play["e4"]},
                Double Play Turned? - {"Yes" if play["gdp"] else "No"},
                Bases - {get_bases_state(play)},
                Fielders - {', '.join(fielder_names)}
        """
        input_prompt = technical_prompt if mode == "technical" else casual_prompt
        response = prompt_gemini_api(input_prompt)
        return response or "Error generating response."

    except Exception as e:
        print(f"Error in generate_play_description: {e}")
        return None

def prompt_gemini_api(prompt):
    """Call Gemini Gen AI API with the given prompt."""
    max_retries = 3
    backoff_time = 5  # seconds
    endpoint_id = os.environ["ENDPOINT_ID"]
    flash_endpoint_id = os.environ["FLASH_ENDPOINT_ID"]
    vertexai.init(project=project_id, location="us-central1")

    # Gemini pro 1.5 model
    pro_model = GenerativeModel(
        f"projects/{project_id}/locations/us-central1/endpoints/{endpoint_id}",
    )
            
    flash_model = GenerativeModel(
        f"projects/{project_id}/locations/us-central1/endpoints/{flash_endpoint_id}",
    )
            
    generation_config = {
        "max_output_tokens": 8192,
        "temperature": 1,
        "top_p": 0.95,
    }

    safety_settings = [
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold=SafetySetting.HarmBlockThreshold.OFF,
        ),
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold=SafetySetting.HarmBlockThreshold.OFF,
        ),
    ]

    # First try with fine-tuned flash_model 
    for attempt in range(max_retries):
        try:
            response = flash_model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            return response.text
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                logger.warning(f"Rate limit exceeded for Flash API. Attempt {attempt + 1}. Retrying in {backoff_time} seconds.")
                time.sleep(backoff_time)
                continue
            logger.warning(f"Flash model failed after {attempt + 1} attempts. Falling back to pro model. Error: {e}")
            break

    # Fallback to fine-tuned pro_model
    try:
        response = pro_model.generate_content(
            prompt,
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        return response.text
    except Exception as e:
        logger.error(f"Both models failed. Final error from pro model: {e}")
        return None

def get_bases_state(play):
    """Helper function to return the base state from play data."""
    bases = []
    if play['br1_pre']:
        bases.append("Runner on first")
    if play['br2_pre']:
        bases.append("Runner on second")
    if play['br3_pre']:
        bases.append("Runner on third")
    return "Bases empty" if not bases else ", ".join(bases)

def get_player_name(player_id):
    """Query BigQuery to get player name by ID."""
    if player_id in player_cache:
        return player_cache[player_id]
    try:
        player_query = f"""
            SELECT first, last FROM `{project_name}.baseball_custom_dataset.2023-2024-players` 
            WHERE id = '{player_id}' LIMIT 1
        """
        q_result = bq_client.query(player_query, job_config=bigquery.QueryJobConfig(use_query_cache=True)).to_dataframe()
        if not q_result.empty:
            player_name = f"{q_result['first'][0]} {q_result['last'][0]}"
            player_cache[player_id] = player_name
            return player_name
        return "Unknown Player"
    except Exception as e:
        print(f"Error fetching player name: {e}")
        return "Unknown Player"

def get_predictions_from_model(project, endpoint_id, instance_dict, location="us-central1"):
    """Get predictions from regression and classification models deployed in Vertex AI."""
    try:
        instance = ParseDict(instance_dict, Value())
        instances = [instance]
        parameters_dict = {}
        parameters = ParseDict(parameters_dict, Value())
        endpoint = ai_client.endpoint_path(
            project=project, location=location, endpoint=endpoint_id
        )
        response = ai_client.predict(
            endpoint=endpoint, instances=instances, parameters=parameters
        )
        predictions = response.predictions
        prediction = dict(predictions[0])
        return prediction.get('value', None)
    except Exception as e:
        logging.error(f"Error getting predictions from model: {e}")
        return None

def fetch_plays(gid):
    plays_query = f"""
            SELECT * FROM `{project_name}.baseball_custom_dataset.2023-2024-plays_v3`
            WHERE gid = '{gid}'
            ORDER BY ordered_event, inning
        """
    plays = bq_client.query_and_wait(query=plays_query,job_config=bigquery.QueryJobConfig(use_query_cache=True), wait_timeout=10).to_dataframe()
        
    return plays

def fetch_game_pbp(game_pk, play):
    # Fetch the game play-by-play data from the Stats API
    url = f"https://statsapi.mlb.com/api/v1.1/game/{game_pk}/feed/live"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        all_plays = data['liveData']['plays']['allPlays']
        logger.info(all_plays)
        return find_matching_play(play, all_plays)
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching game PBP data: {e}")
        return None

def find_matching_play(play, pbp_data):
    # We want to match data coming from the Retrosheet to MLB data
    for pbp_play in pbp_data:
        batter_name = get_player_name(play['batter'])
        pitcher_name = get_player_name(play['pitcher'])
        is_top_inning = True if play['top_bot'] == 0 else False
        logger.info(f"pbp_play: {pbp_play}")
        try:
            if (pbp_play['about']['inning'] == play['inning'] and
            pbp_play['about']['isTopInning'] == is_top_inning and
            pbp_play['matchup']['batter']['fullName'] == batter_name and
            pbp_play['matchup']['pitcher']['fullName'] == pitcher_name
            ):
                return pbp_play
        except KeyError:
            return None
    return None

def fetch_last_10_games(game_type):
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
        "OAK": 133,
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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
