"""
train_ballondor.py - Train the Ballon d'Or model (student-level)

SIMPLE IDEA: We have a CSV with player stats and a "ballondor_score" column.
We train a RandomForest to predict that score from the other columns.
Then we save the model so we can use it later.

Run:  python train_ballondor.py   (from backend folder)
"""

import os
import json
import datetime
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# ========================================
# PATHS (relative to this script's location)
# ========================================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(SCRIPT_DIR, "..", "data", "ballondor_train.csv")
MODEL_DIR = os.path.join(SCRIPT_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "ballondor_model.pkl")
META_PATH = os.path.join(MODEL_DIR, "meta.json")

# ========================================
# Which columns we use to predict (must match the CSV)
# ========================================
# We do NOT use: id, name, ballondor_score (id/name are names, ballondor_score is what we predict)
FEATURES = [
    "goals",
    "assists",
    "minutes",
    "avg_rating",
    "shots_on_target",
    "key_passes",
    "dribbles_completed",
    "tackles",
    "interceptions",
    "clean_sheets",
    "team_trophies",
    "ucl_stage_score",
    "league_strength",
]

# The column we want to predict (the "answer" for each row)
TARGET = "ballondor_score"

# ========================================
# STEP 1: Load the CSV file
# ========================================
print(f"Loading data from: {CSV_PATH}")
df = pd.read_csv(CSV_PATH)
print(f"Loaded {len(df)} rows, {len(df.columns)} columns")
print(f"Columns: {list(df.columns)}")

# ========================================
# STEP 2: Split into X (inputs) and y (what we predict)
# ========================================
X = df[FEATURES]   # the numbers we use to predict
y = df[TARGET]     # the score we want to predict

print(f"\nFeatures shape: {X.shape}")
print(f"Target range: {y.min():.2f} to {y.max():.2f} (mean={y.mean():.2f})")

# ========================================
# STEP 3: Train/test split (80% train, 20% test)
# ========================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"\nTrain size: {len(X_train)}, Test size: {len(X_test)}")

# ========================================
# STEP 4: Train the model (RandomForest = many small decision trees)
# ========================================
# 100 trees, max depth 10. random_state=42 so we get the same result every time.
model = RandomForestRegressor(
    n_estimators=100,
    max_depth=10,
    random_state=42,
)
print("\nTraining RandomForestRegressor...")
model.fit(X_train, y_train)
print("Training complete!")

# ========================================
# STEP 5: See how good the model is (on the 20% we didn't train on)
# ========================================
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)   # average error in points
r2 = r2_score(y_test, y_pred)               # how much of the variation we explain

print(f"\n--- How good is the model? ---")
print(f"MAE: {mae:.4f}  (on average we're wrong by about {mae:.1f} points)")
print(f"R²:  {r2:.4f}  (we explain about {r2*100:.0f}% of the score variation)")

# ========================================
# STEP 6: Which stats mattered most? (optional to read)
# ========================================
print(f"\n--- Which stats mattered most? ---")
importances = model.feature_importances_
for feat, imp in sorted(zip(FEATURES, importances), key=lambda x: -x[1]):
    print(f"  {feat:25s} {imp:.4f}")

# ========================================
# STEP 7: Save the model to a file (.pkl)
# ========================================
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(model, MODEL_PATH)
print(f"\nModel saved to: {MODEL_PATH}")

# ========================================
# STEP 8: Save a small info file (what we used, MAE, R²)
# ========================================
meta = {
    "features": FEATURES,
    "target": TARGET,
    "metrics": {
        "mae": round(mae, 4),
        "r2": round(r2, 4),
    },
    "model_type": "RandomForestRegressor",
    "n_estimators": 100,
    "max_depth": 10,
    "train_rows": len(X_train),
    "test_rows": len(X_test),
    "total_rows": len(df),
    "trained_at": datetime.datetime.now().isoformat(),
}

with open(META_PATH, "w") as f:
    json.dump(meta, f, indent=2)
print(f"Metadata saved to: {META_PATH}")

print("\nDone! Model is ready for predictions.")
