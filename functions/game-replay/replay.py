import os
import time
from flask import Flask, jsonify, Response, request
from google.cloud import bigquery
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting

app = Flask(__name__)
project_id = os.environ["PROJECT_ID"]
project_name = os.environ["PROJECT_NAME"]
bq_client = bigquery.Client()

@app.route('/game-replay', methods=['POST'])
def game_replay():
    """Simulate game replays and stream play-by-play summaries."""
    request_json = request.get_json()

    if not request_json or 'gid' not in request_json or 'mode' not in request_json:
        return jsonify({"error": "Invalid input. 'gid' and 'mode' are required."}), 400

    gid = request_json['gid']
    mode = request_json['mode']
    interval = request_json.get('interval', 20)

    try:
        # Query data from BigQuery
        plays_query = f"""
            SELECT * FROM `{project_name}.baseball_custom_dataset.2023-2024-plays`
            WHERE gid = '{gid}'
            ORDER BY inning, top_bot, nump
        """
        plays = bq_client.query_and_wait(query=plays_query, wait_timeout=10).to_dataframe()
        def stream_replay():
            for _, play in plays.iterrows():
                strategy = generate_play_description(play, mode)

                if strategy:
                    yield f"data: {strategy}\n\n"
                else:
                    yield f"data: Error generating strategy. Please try again later.\n\n"
                time.sleep(interval)

        return Response(stream_replay(), content_type="text/event-stream", headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
            Limit the response to one small paragraphs.

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
            Act as a baseball commentator and provide a play-by-play description of the baseball action.
            Explain the baseball play in simple and engaging terms for casual fans. 
            Describe the action, the players involved, and the strategy in an easy-to-understand way. 
            Provide context for why this play matters in the game and make it exciting. Limit the response to one small paragraphs.
            
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
        q_result = bq_client.query(player_query).to_dataframe()
        if not q_result.empty:
            return f"{q_result['first'][0]} {q_result['last'][0]}"
        return "Unknown Player"
    except Exception as e:
        print(f"Error fetching player name: {e}")
        return "Unknown Player"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))