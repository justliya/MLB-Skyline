import os
import time
import datetime
import traceback
import logging
from flask import Flask, jsonify, Response, request
from google.cloud import bigquery, firestore, aiplatform
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting
from google.protobuf.json_format import ParseDict
from google.protobuf.struct_pb2 import Value
import requests
from datetime import datetime

app = Flask(__name__)
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

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Utility to save state to Firestore
def save_state(user_id, state):
    db.collection("replay_states").document(user_id).set(state)

# Utility to load state from Firestore
def load_state(user_id):
    doc = db.collection("replay_states").document(user_id).get()
    if doc.exists:
        return doc.to_dict()
    return {"is_paused": False, "current_play_index": 0, "last_active": datetime.now(datetime.timezone.utc)}

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
    state["last_active"] = datetime.now(datetime.timezone.utc)
    state["gid"] = gid
    state["mode"] = mode
    state["interval"] = interval
    save_state(user_id, state)

    logger.info(f"Replay paused for user {user_id}.")
    return jsonify({"message": f"Replay paused for user {user_id}."}), 200

# Route to resume the replay
@app.route('/resume', methods=['POST'])
def resume_replay():
    user_id = request.json.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing 'user_id'."}), 400

    state = load_state(user_id)
    if state["is_paused"]:
        state["is_paused"] = False
        state["last_active"] = datetime.now(datetime.UTC)
        save_state(user_id, state)
        logger.info(f"Replay resumed for user {user_id}.")
        return _resume_replay(user_id)
    else:
        return jsonify({"message": "Replay is already running."}), 200

@app.route('/games', methods=['GET'])
def get_games():
    """Fetch recent games MLB."""
    season = request.args.get('season', default=2024, type=int)
    sport_id = request.args.get('sport_id', default=1, type=int)
    game_type = request.args.get('game_type', default='R', type=str)

    games = fetch_games(season, sport_id, game_type)
    if not games:
        return jsonify({"error": "No games found."}), 404
    return jsonify(games), 200

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
            state["last_active"] = datetime.now(datetime.date)
        save_state(user_id, state)

        plays = fetch_game_pbp(gid)
        
        return Response(stream_replay(user_id, plays, mode, interval), content_type="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        })
    except Exception as e:
        error_message = str(e)
        stack_trace = traceback.format_exc()
        line_number = stack_trace.splitlines()[-3]
        return jsonify({"error": error_message, "stack_trace": stack_trace, "line_number": line_number}), 500

def _resume_replay(user_id):
    """Internal function to resume game replays and stream play-by-play summaries."""
    try:
        state = load_state(user_id)
        gid = state.get("gid")
        mode = state.get("mode")
        interval = state.get("interval")

        if not gid or not mode or not interval:
            return jsonify({"error": "Missing 'gid', 'mode', or 'interval' in state."}), 400

        plays = fetch_game_pbp(gid)

        return Response(stream_replay(user_id, plays, mode, interval, resume=True), content_type="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        })
    except Exception as e:
        error_message = str(e)
        stack_trace = traceback.format_exc()
        line_number = stack_trace.splitlines()[-3]
        return jsonify({"error": error_message, "stack_trace": stack_trace, "line_number": line_number}), 500

def stream_replay(user_id, plays, mode, interval, resume=False):
    """Stream the replay play-by-play."""
    try:
        state = load_state(user_id) 
        current_index = state.get("current_play_index", 0)

        for index, play in enumerate(plays):
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
        batter_name = play['matchup']['batter']['fullName']
        pitcher_name = play['matchup']['pitcher']['fullName']

        technical_prompt = f"""
            Act as a baseball analyst and provide a detailed summary of the game for technical fans.
            Include information about the pitch type, strategy considerations, 
            batter-pitcher matchup, and how the current game context influences decision-making. 
            Use advanced terminology to break down the pitch sequence, expected outcomes, and strategic intent.
            Limit the response to 1-2 sentences.

            Play: {play["result"]["event"]}
            Context:
            Batter Stats:
                Batter - {batter_name},
                Bat Hand - {play["matchup"]["batSide"]["description"]},
                Plate Appearances - {play["count"]["plateAppearances"]},
                At-Bats - {play["count"]["atBats"]},
                Hits - {play["count"]["hits"]},
                Home Runs - {play["count"]["homeRuns"]},
                RBIs - {play["count"]["rbi"]},
                Walks - {play["count"]["walks"]},
            Pitcher Stats:
                Pitcher - {pitcher_name},
                Pitch Hand - {play["matchup"]["pitchHand"]["description"]},
                Pitch - {play["pitchIndex"]},
                Number of Pitches - {play["count"]["pitches"]},
                Strikeouts - {play["count"]["strikeOuts"]},
                Earned Runs - {play["count"]["earnedRuns"]},
                Wild Pitches - {play["count"]["wildPitches"]},
                Loss Indicator - {play["count"]["losses"]},
            Fielding Stats:
            Outs Before Play - {play["count"]["outsBeforePlay"]},
            Outs After Play - {play["count"]["outsAfterPlay"]},
            Putouts by Fielders - {play["count"]["putOuts"]},
            Assists by Fielders - {play["count"]["assists"]},
            Errors - {play["count"]["errors"]},
            Grounded into Double Play - {play["count"]["groundIntoDoublePlay"]},
            Triple Play - {play["count"]["triplePlay"]},
            Ball in Play Indicator - {play["count"]["ballsInPlay"]}

        """
        casual_prompt = f"""
            Act as a baseball commentator and provide a play-by-play description of the baseball event.
            Explain the baseball play in simple and engaging terms for casual fans. 
            Describe the action, the players involved, and the strategy in an easy-to-understand way. 
            Focusing on providing context on why this play matters in the game and make it exciting. Limit the response to 1-2 sentences.
            
            Play: {play["result"]["event"]}
            Context:
            Batter:
                Name - {batter_name},
                Hits - {play["count"]["hits"]},
                Home Runs - {play["count"]["homeRuns"]},
            Pitcher:
                Name - {pitcher_name},
                Strikeouts - {play["count"]["strikeOuts"]},
                Earned Runs Allowed - {play["count"]["earnedRuns"]},
            Fielding:
                Outs Made - {play["count"]["outsAfterPlay"] - play["count"]["outsBeforePlay"]},
                Errors on This Play - {play["count"]["errors"]},
                Double Play Turned? - {"Yes" if play["count"]["groundIntoDoublePlay"] else "No"}
                Bases - {get_bases_state(play)}
        """
        input_prompt = technical_prompt if mode == "technical" else casual_prompt
        response = prompt_gemini_api(input_prompt)
        return response or "Error generating response."

    except Exception as e:
        print(f"Error in generate_play_description: {e}")
        return None

def prompt_gemini_api(prompt):
    """Call Gemini Gen AI API with the given prompt."""
    try:
        project_id = os.environ["PROJECT_ID"]
        endpoint_id = os.environ["ENDPOINT_ID"]
        vertexai.init(project=project_id, location="us-central1")

        model = GenerativeModel(
            f"projects/{project_id}/locations/us-central1/endpoints/{endpoint_id}",
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

        response = model.generate_content(
            prompt,
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        return response.text

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return None

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
        if predictions:
            prediction = predictions[0]
            if "classification" in prediction:
                return {"class": prediction["classification"]["displayName"], "confidence": prediction["classification"]["confidence"]}
            elif "regression" in prediction:
                return {"value": prediction["regression"]["value"]}
            else:
                logging.warning("Unknown prediction type.")
                return None
        else:
            logging.warning("No predictions returned.")
            return None
    except Exception as e:
        logging.error(f"Error getting predictions from model: {e}")
        return None


    plays_query = f"""
            SELECT * FROM `{project_name}.baseball_custom_dataset.2023-2024-plays_v2`
            WHERE gid = '{gid}'
            ORDER BY event_order, inning
        """
    plays = bq_client.query_and_wait(query=plays_query,job_config=bigquery.QueryJobConfig(use_query_cache=True), wait_timeout=10).to_dataframe()
        
    return plays

def fetch_games(season, sport_id, game_type):

    url = f"https://statsapi.mlb.com/api/v1/schedule?sportId={sport_id}&season={season}&gameTypes={game_type}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        games = []
        if data['totalGames'] > 0:
            for date_info in data['dates'][-15:]: 
                for game in date_info['games']:
                    games.append({
                        'gamePk': game['gamePk'],
                        'gameDate': game['gameDate'],
                        'teams': {
                            'away': {
                                'name': game['teams']['away']['team']['name'],
                                'id': game['teams']['away']['team']['id']
                            },
                            'home': {
                                'name': game['teams']['home']['team']['name'],
                                'id': game['teams']['home']['team']['id']
                            }
                        },
                        'score': {
                            'away': game['teams']['away']['score'],
                            'home': game['teams']['home']['score']
                        },
                        'status': game['status']['detailedState']
                    })
        return games
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching games from Stats API: {e}")
        return None

def fetch_game_pbp(game_pk):
    # Fetch the game play-by-play data from the Stats API
    url = f"https://statsapi.mlb.com/api/v1.1/game/{game_pk}/PlayByPlay"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()['allPlays']
        return data
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching game PBP data: {e}")



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
