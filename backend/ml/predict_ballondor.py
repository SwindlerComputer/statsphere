"""
predict_ballondor.py - Get ML score for each player (student-level)

SIMPLE IDEA: Load the saved model. Read a list of players (with their stats) from stdin.
For each player, the model gives a number (ml_score). We print those back as JSON.

Input:  JSON with "players" array (each player has id, goals, assists, etc.)
Output: JSON with "results" array (each has id and ml_score)

The Node backend can run this script and pass player data in, then use the scores.
"""

import sys
import json
import os
import joblib
import pandas as pd

# ========================================
# PATHS
# ========================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "model", "ballondor_model.pkl")
META_PATH = os.path.join(SCRIPT_DIR, "model", "meta.json")

# ========================================
# STEP 1: Load the saved model and the list of feature names
# ========================================
if not os.path.exists(MODEL_PATH):
    print(json.dumps({"error": "Model file not found. Run train_ballondor.py first."}))
    sys.exit(1)

if not os.path.exists(META_PATH):
    print(json.dumps({"error": "Meta file not found. Run train_ballondor.py first."}))
    sys.exit(1)

model = joblib.load(MODEL_PATH)

with open(META_PATH, "r") as f:
    meta = json.load(f)

FEATURES = meta["features"]

# ========================================
# STEP 2: Read the list of players (Node sends this in)
# ========================================
try:
    raw_input = sys.stdin.read()
    data = json.loads(raw_input)
except json.JSONDecodeError as e:
    print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
    sys.exit(1)

players = data.get("players", [])
if not players:
    print(json.dumps({"error": "No players provided in input"}))
    sys.exit(1)

# ========================================
# STEP 3: For each player, get the 13 numbers, then ask the model for a score
# ========================================
rows = []
ids = []
for player in players:
    row = {}
    for feat in FEATURES:
        row[feat] = float(player.get(feat, 0))   # use 0 if a stat is missing
    rows.append(row)
    ids.append(player.get("id", 0))

# Put into a table and run the model
df = pd.DataFrame(rows, columns=FEATURES)
predictions = model.predict(df)

results = []
for i in range(len(predictions)):
    results.append({
        "id": ids[i],
        "ml_score": round(float(predictions[i]), 2),
    })

# ========================================
# STEP 4: Send back id and ml_score for each player (as JSON)
# ========================================
output = {
    "results": results,
    "meta": {
        "model_type": meta.get("model_type", "RandomForestRegressor"),
        "features_used": FEATURES,
        "metrics": meta.get("metrics", {}),
        "trained_at": meta.get("trained_at", "unknown"),
    },
}

print(json.dumps(output))
