# StatSphere ML Pipeline

## Overview

This is a simple Machine Learning pipeline that predicts Ballon d'Or scores for football players. It uses **Linear Regression** from scikit-learn.

## What is Machine Learning?

Machine Learning (ML) is when a computer learns patterns from data instead of being explicitly programmed. In this project:

- **Input (Features)**: Player stats like goals, assists, xG, xA
- **Output (Target)**: Ballon d'Or score
- **The model learns**: The relationship between stats and scores

## Folder Structure

```
ml/
├── data/
│   ├── raw/              # Original CSV files (input)
│   │   └── players.csv   # Player data
│   └── processed/        # Cleaned/transformed data (output)
│       ├── players_with_features.csv
│       └── predictions.csv
├── features.py           # Feature engineering functions
├── train.py              # Train the model
├── predict.py            # Make predictions
├── model.pkl             # Saved trained model
├── feature_columns.pkl   # List of features used
└── README.md             # This file
```

## How to Run

### Step 1: Install Dependencies

```bash
pip install pandas scikit-learn
```

### Step 2: Train the Model

```bash
cd ml
python train.py
```

This will:
1. Load `data/raw/players.csv`
2. Calculate features (goals_per_90, league_weight, etc.)
3. Train a Linear Regression model
4. Save the model to `model.pkl`

### Step 3: Make Predictions

```bash
python predict.py
```

This will:
1. Load the trained model
2. Predict scores for all players
3. Rank players by predicted score
4. Save results to `data/processed/predictions.csv`

## Files Explained

### features.py

Contains functions to calculate features:

- `calculate_goals_per_90(goals, minutes)` - Goals per 90 minutes
- `calculate_assists_per_90(assists, minutes)` - Assists per 90 minutes
- `get_league_weight(league)` - Returns league difficulty weight
- `add_features_to_dataframe(df)` - Adds all features to a DataFrame

### train.py

Trains the model in these steps:

1. **Load CSV** - Read player data
2. **Add features** - Calculate goals_per_90, league_weight, etc.
3. **Prepare X and y** - X = features, y = target score
4. **Split data** - 80% training, 20% testing
5. **Train model** - Fit Linear Regression
6. **Evaluate** - Check R² score
7. **Save model** - Store to model.pkl

### predict.py

Makes predictions:

1. **Load model** - Read model.pkl
2. **Load data** - Read player CSV
3. **Add features** - Same as training
4. **Predict** - Use model to predict scores
5. **Rank** - Sort players by score
6. **Output** - Display and save results

## Key Concepts

### Linear Regression

A simple algorithm that finds the best line through data:

```
predicted_score = w1*goals + w2*assists + w3*xG + ... + bias
```

The model learns the weights (w1, w2, etc.) during training.

### Feature Engineering

Creating new useful columns from raw data:

- **goals_per_90** = (goals / minutes) × 90
- **league_weight** = Difficulty factor (Premier League = 1.0, Saudi = 0.7)

### Train/Test Split

We split data into:
- **Training set (80%)** - Model learns from this
- **Testing set (20%)** - We check accuracy on this

### R² Score

Measures how well the model fits:
- **R² = 1.0** - Perfect predictions
- **R² = 0.0** - No better than guessing average
- **R² > 0.8** - Generally good

## CSV Format

The input CSV needs these columns:

| Column | Description |
|--------|-------------|
| name | Player name |
| team | Team name |
| league | League name |
| goals | Total goals |
| assists | Total assists |
| xG | Expected goals |
| xA | Expected assists |
| minutes_played | Total minutes |
| ballon_dor_score | Target score (for training) |

## Example Output

```
🥇 #1: Erling Haaland
      Team: Manchester City (Premier League)
      Predicted Score: 145.2
      Goals: 25, Assists: 5

🥈 #2: Mohamed Salah
      Team: Liverpool (Premier League)
      Predicted Score: 138.1
      Goals: 19, Assists: 12
```

## Author

StatSphere - TU Dublin Final Year Project

