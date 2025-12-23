# ========================================
# predict.py - Make Predictions with Trained Model
# ========================================
# This script loads the trained model and predicts Ballon d'Or scores.
# It outputs a ranked list of players by predicted score.
#
# STEPS:
# 1. Load the saved model from model.pkl
# 2. Load player data from CSV
# 3. Add calculated features
# 4. Make predictions
# 5. Rank players by predicted score
# 6. Display results
#
# Run this script: python predict.py

import pandas as pd
import pickle
from features import add_features_to_dataframe

# ========================================
# STEP 1: Load the trained model
# ========================================
print("=" * 50)
print("STEP 1: Loading trained model...")
print("=" * 50)

# Load the model from the pickle file
with open("model.pkl", "rb") as file:
    model = pickle.load(file)

# Load the feature columns list
with open("feature_columns.pkl", "rb") as file:
    feature_columns = pickle.load(file)

print("Model loaded successfully!")
print(f"Features used: {feature_columns}")
print()

# ========================================
# STEP 2: Load player data
# ========================================
print("=" * 50)
print("STEP 2: Loading player data...")
print("=" * 50)

# Read the CSV file
# You can change this to any CSV file with the same columns
data = pd.read_csv("data/raw/players.csv")

print(f"Loaded {len(data)} players")
print()

# ========================================
# STEP 3: Add calculated features
# ========================================
print("=" * 50)
print("STEP 3: Adding calculated features...")
print("=" * 50)

# Add the same features we used during training
data = add_features_to_dataframe(data)
print()

# ========================================
# STEP 4: Make predictions
# ========================================
print("=" * 50)
print("STEP 4: Making predictions...")
print("=" * 50)

# Get the feature columns from the data
X = data[feature_columns]

# Use the model to predict Ballon d'Or scores
predictions = model.predict(X)

# Add predictions to the dataframe
data["predicted_score"] = predictions

# Round to 1 decimal place for cleaner display
data["predicted_score"] = data["predicted_score"].round(1)

print(f"Made predictions for {len(data)} players")
print()

# ========================================
# STEP 5: Rank players by predicted score
# ========================================
print("=" * 50)
print("STEP 5: Ranking players...")
print("=" * 50)

# Sort by predicted score (highest first)
ranked_data = data.sort_values("predicted_score", ascending=False)

# Add rank column
ranked_data["rank"] = range(1, len(ranked_data) + 1)

print("Players ranked by predicted Ballon d'Or score:")
print()

# ========================================
# STEP 6: Display results
# ========================================
print("=" * 50)
print("BALLON D'OR PREDICTIONS")
print("=" * 50)
print()

# Display each player with their rank and score
for index, row in ranked_data.iterrows():
    rank = row["rank"]
    name = row["name"]
    team = row["team"]
    league = row["league"]
    predicted = row["predicted_score"]
    
    # Add medal for top 3 (using text instead of emoji for Windows compatibility)
    if rank == 1:
        medal = "[GOLD]"
    elif rank == 2:
        medal = "[SILVER]"
    elif rank == 3:
        medal = "[BRONZE]"
    else:
        medal = "      "
    
    print(f"{medal} #{rank}: {name}")
    print(f"      Team: {team} ({league})")
    print(f"      Predicted Score: {predicted}")
    print(f"      Goals: {row['goals']}, Assists: {row['assists']}")
    print()

# ========================================
# Save predictions to CSV
# ========================================
print("=" * 50)
print("Saving predictions to file...")
print("=" * 50)

# Select columns to save
output_columns = ["rank", "name", "team", "league", "goals", "assists", "predicted_score"]
output_data = ranked_data[output_columns]

# Save to CSV
output_data.to_csv("data/processed/predictions.csv", index=False)
print("Predictions saved to data/processed/predictions.csv")
print()

print("=" * 50)
print("PREDICTION COMPLETE!")
print("=" * 50)

