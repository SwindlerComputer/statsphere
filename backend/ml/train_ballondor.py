"""
train_ballondor.py - Train a RandomForest model for Ballon d'Or prediction
===========================================================================
Reads the CSV exported by exportBallonDorTrainingData.js,
trains a RandomForestRegressor with an 80/20 split,
prints MAE and R², and saves the model + metadata.

Run:  python3 backend/ml/train_ballondor.py
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
# FEATURE COLUMNS (must match CSV exactly)
# ========================================
# These are the input features the model learns from.
# Excluded: id, name (identifiers), ballondor_score (target).
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

# The column we are predicting
TARGET = "ballondor_score"

# ========================================
# STEP 1: Load data
# ========================================
print(f"Loading data from: {CSV_PATH}")
df = pd.read_csv(CSV_PATH)
print(f"Loaded {len(df)} rows, {len(df.columns)} columns")
print(f"Columns: {list(df.columns)}")

# ========================================
# STEP 2: Prepare features (X) and target (y)
# ========================================
X = df[FEATURES]
y = df[TARGET]

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
# STEP 4: Train RandomForestRegressor
# ========================================
# n_estimators = number of trees (100 is a common default)
# random_state = seed for reproducibility
model = RandomForestRegressor(
    n_estimators=100,
    max_depth=10,
    random_state=42,
)
print("\nTraining RandomForestRegressor...")
model.fit(X_train, y_train)
print("Training complete!")

# ========================================
# STEP 5: Evaluate on test set
# ========================================
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\n--- Model Evaluation ---")
print(f"MAE  (Mean Absolute Error): {mae:.4f}")
print(f"R²   (R-squared):          {r2:.4f}")
print(f"MAE means: on average, predictions are off by ~{mae:.2f} points")
print(f"R² means:  the model explains {r2*100:.1f}% of the variance in scores")

# ========================================
# STEP 6: Feature importances
# ========================================
print(f"\n--- Feature Importances ---")
importances = model.feature_importances_
for feat, imp in sorted(zip(FEATURES, importances), key=lambda x: -x[1]):
    print(f"  {feat:25s} {imp:.4f}")

# ========================================
# STEP 7: Save model with joblib
# ========================================
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(model, MODEL_PATH)
print(f"\nModel saved to: {MODEL_PATH}")

# ========================================
# STEP 8: Save metadata (features, metrics, etc.)
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
