import json
import pandas as pd
from google.cloud import bigquery

# Initialize BigQuery client
bq_client = bigquery.Client()

# Query to retrieve play data
plays_query = """
SELECT gid, event, inning, top_bot, batter, pitcher, count, outs_pre, br1_pre, br2_pre, br3_pre
FROM `your_project_id.your_dataset.plays`
LIMIT 1000
"""
plays = bq_client.query(plays_query).to_dataframe()

# Helper function to format base state
def format_bases(row):
    bases = []
    if row['br1_pre']:
        bases.append("Runner on first")
    if row['br2_pre']:
        bases.append("Runner on second")
    if row['br3_pre']:
        bases.append("Runner on third")
    return ", ".join(bases) if bases else "Bases empty"

# Prepare training data
training_data = []
for _, row in plays.iterrows():
    play_context = {
        "Play": row["event"],
        "Context": f"Batter: {row['batter']}, Pitcher: {row['pitcher']}, "
                   f"Inning: {row['inning']}, Count: {row['count']}, "
                   f"Outs: {row['outs_pre']}, {format_bases(row)}."
    }
    natural_language_explanation = (
        "Generate a meaningful explanation based on baseball rules. "
        "E.g., why a sacrifice bunt was used, why a pitcher's curveball was effective, etc."
    )
    
    training_data.append({
        "systemInstruction": {
            "role": "Baseball analyst AI",
            "parts": [
                {"text": "Generate natural language explanations for baseball plays based on their context."}
            ]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{play_context}"}]
            },
            {
                "role": "assistant",
                "parts": [{"text": natural_language_explanation}]
            }
        ]
    })

with open("training_dataset.jsonl", "w") as f:
    for entry in training_data:
        f.write(json.dumps(entry) + "\n")
