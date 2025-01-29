import os
import time
import threading
import datetime
import traceback
import logging
from flask import Flask, jsonify, Response, request
from google.cloud import bigquery, firestore
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting

app = Flask(__name__)
project_id = os.environ["PROJECT_ID"]
project_name = os.environ["PROJECT_NAME"]
db_name = os.environ["DEFAULT_DATABASE"]
bq_client = bigquery.Client()
db = firestore.Client(database=db_name)

DEFAULT_TIMEOUT = 300  # 5 minutes

endpoint_id = os.environ.get("PITCH_PREDICTION_ENDPOINT_ID")
location = "us-central1"

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

# Route to resume the replay
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

@app.route('/predict/pitch', methods=['POST']):
def predict_pitch():
    """Predict the next pitch type for a given game and pitcher."""
    request_json = request.get_json()
    
    gid = request_json.get("gid")

    if not gid
        return jsonify({"error": "Missing 'gid' parameter."}), 400
    
    # Fetch latest play for the given game and pitcher
    features = get_latest_play(gid, pitcher)
    
    if not features:
        return jsonify({"error": "No play data found for given game and pitcher."}), 404
    
    # Get prediction from the model
    prediction = predict_pitch(features)
    
    return jsonify({"prediction": prediction})
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
        
        # Generate prompts
        technical_prompt = f"""
            Act as a baseball analyst and provide a detailed summary of the game for technical fans.
            Include information about the pitch type, strategy considerations, 
            batter-pitcher matchup, and how the current game context influences decision-making. 
            Use advanced terminology to break down the pitch sequence, expected outcomes, and strategic intent.
            Limit the response to 1-2 sentences.

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
            Pitcher Stats:
                Pitcher - {pitcher_name},
                Pitch Hand - {play["pithand"]},
                Pitch - {play["pitches"]},
                Number of Pitches - {play["nump"]},
                Strikeouts - {play["k"]},
                Earned Runs - {play["er"]},
                Wild Pitches - {play["wp"]},
                Loss Indicator - {play["lp"]},
            Fielding Stats:
            Outs Before Play - {play["outs_pre"]},
            Outs After Play - {play["outs_post"]},
            Putouts by Fielders - {play["po0"] + play["po1"] + play["po2"] + play["po3"] + play["po4"] + play["po5"] + play["po6"] + play["po7"] + play["po8"] + play["po9"]},
            Assists by Fielders - {play["a1"] + play["a2"] + play["a3"] + play["a4"] + play["a5"] + play["a6"] + play["a7"] + play["a8"] + play["a9"]},
            Errors - {play["e1"] + play["e2"] + play["e3"] + play["e4"] + play["e5"] + play["e6"] + play["e7"] + play["e8"] + play["e9"]},
            Grounded into Double Play - {play["gdp"]},
            Triple Play - {play["tp"]},
            Ball in Play Indicator - {play["bip"]}

        """
        casual_prompt = f"""
            Act as a baseball commentator and provide a play-by-play description of the baseball event.
            Explain the baseball play in simple and engaging terms for casual fans. 
            Describe the action, the players involved, and the strategy in an easy-to-understand way. 
            Focusing on providing context on why this play matters in the game and make it exciting. Limit the response to 1-2 sentences.
            
            Play: {play["event"]}
            Context:
            Batter:
                Name - {batter_name},
                Hits - {play["single"] + play["double"] + play["triple"] + play["hr"]},
                Home Runs - {play["hr"]},
            Pitcher:
                Name - {pitcher_name},
                Strikeouts - {play["k"]},
                Earned Runs Allowed - {play["er"]},
            Fielding:
                Outs Made - {play["outs_post"] - play["outs_pre"]},
                Errors on This Play - {play["e1"] + play["e2"] + play["e3"] + play["e4"]},
                Double Play Turned? - {"Yes" if play["gdp"] else "No"}
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
    try:
        player_query = f"""
            SELECT first, last FROM `{project_name}.baseball_custom_dataset.2023-2024-players` 
            WHERE id = '{player_id}' LIMIT 1
        """
        q_result = bq_client.query(player_query, ob_config=bigquery.QueryJobConfig(use_query_cache=True)).to_dataframe()
        if not q_result.empty:
            return f"{q_result['first'][0]} {q_result['last'][0]}"
        return "Unknown Player"
    except Exception as e:
        print(f"Error fetching player name: {e}")
        return "Unknown Player"

def fetch_plays(gid):
    plays_query = f"""
            SELECT * FROM `{project_name}.baseball_custom_dataset.2023-2024-plays_v2`
            WHERE gid = '{gid}'
            ORDER BY event_order, inning
        """
        plays = bq_client.query_and_wait(query=plays_query,job_config=bigquery.QueryJobConfig(use_query_cache=True), wait_timeout=10).to_dataframe()
        
        return plays

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
