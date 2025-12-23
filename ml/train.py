# ========================================
# train.py - Train the Ballon d'Or Prediction Model
# ========================================
# This script trains a Linear Regression model to predict Ballon d'Or scores.
#
# WHAT IS LINEAR REGRESSION?
# - A simple ML algorithm that finds the best straight line through data
# - It learns the relationship between input features (X) and output (y)
# - Formula: y = w1*x1 + w2*x2 + ... + b (weights and bias)
#
# STEPS:
# 1. Load the CSV data
# 2. Add calculated features
# 3. Split into X (features) and y (target)
# 4. Train the model
# 5. Save the model to a file
#
# Run this script: python train.py

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import pickle
from features import add_features_to_dataframe

# ========================================
# STEP 1: Load the CSV data
# ========================================
print("=" * 50)
print("STEP 1: Loading data from CSV...")
print("=" * 50)

# Read the CSV file into a pandas DataFrame
data = pd.read_csv("data/raw/players.csv")

print(f"Loaded {len(data)} players")
print(f"Columns: {list(data.columns)}")
print()

# ========================================
# STEP 2: Add calculated features
# ========================================
print("=" * 50)
print("STEP 2: Adding calculated features...")
print("=" * 50)

# Use our features.py function to add new columns
data = add_features_to_dataframe(data)

# Save the processed data to data/processed/
data.to_csv("data/processed/players_with_features.csv", index=False)
print("Saved processed data to data/processed/players_with_features.csv")
print()

# ========================================
# STEP 3: Prepare X (features) and y (target)
# ========================================
print("=" * 50)
print("STEP 3: Preparing features and target...")
print("=" * 50)

# X = the input features we use to make predictions
# These are the columns the model will learn from
feature_columns = [
    "goals",
    "assists", 
    "xG",
    "xA",
    "goals_per_90",
    "assists_per_90",
    "league_weight"
]

X = data[feature_columns]

# y = the target we want to predict (Ballon d'Or score)
y = data["ballon_dor_score"]

print(f"Features (X): {feature_columns}")
print(f"Target (y): ballon_dor_score")
print(f"X shape: {X.shape}")  # (rows, columns)
print(f"y shape: {y.shape}")  # (rows,)
print()

# ========================================
# STEP 4: Split data into training and testing sets
# ========================================
print("=" * 50)
print("STEP 4: Splitting data into train/test sets...")
print("=" * 50)

# Split the data: 80% for training, 20% for testing
# random_state=42 makes the split reproducible (same result every time)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2,      # 20% for testing
    random_state=42     # For reproducibility
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")
print()

# ========================================
# STEP 5: Train the Linear Regression model
# ========================================
print("=" * 50)
print("STEP 5: Training Linear Regression model...")
print("=" * 50)

# Create the model
model = LinearRegression()

# Train the model on the training data
# This is where the model learns the weights
model.fit(X_train, y_train)

print("Model trained successfully!")
print()

# Show what the model learned (the weights for each feature)
print("Model coefficients (weights):")
for i, col in enumerate(feature_columns):
    weight = model.coef_[i]
    print(f"  {col}: {weight:.4f}")
print(f"  Intercept (bias): {model.intercept_:.4f}")
print()

# ========================================
# STEP 6: Evaluate the model
# ========================================
print("=" * 50)
print("STEP 6: Evaluating model performance...")
print("=" * 50)

# Calculate R² score (how well the model fits the data)
# R² = 1.0 means perfect fit, R² = 0 means no better than average
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)

print(f"Training R² score: {train_score:.4f}")
print(f"Testing R² score: {test_score:.4f}")

# Make predictions on test data
predictions = model.predict(X_test)
print("\nSample predictions vs actual:")
for i in range(min(3, len(X_test))):
    actual = y_test.iloc[i]
    predicted = predictions[i]
    print(f"  Actual: {actual:.1f}, Predicted: {predicted:.1f}")
print()

# ========================================
# STEP 7: Save the model to a file
# ========================================
print("=" * 50)
print("STEP 7: Saving model to file...")
print("=" * 50)

# Use pickle to save the model to a file
# This lets us load it later without retraining
with open("model.pkl", "wb") as file:
    pickle.dump(model, file)

print("Model saved to model.pkl")
print()

# Also save the feature columns list (we need this for predictions)
with open("feature_columns.pkl", "wb") as file:
    pickle.dump(feature_columns, file)

print("Feature columns saved to feature_columns.pkl")
print()

print("=" * 50)
print("TRAINING COMPLETE!")
print("=" * 50)

