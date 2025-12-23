# ========================================
# features.py - Feature Engineering
# ========================================
# This file calculates features (input variables) for our ML model.
# Features are the numbers we use to predict the Ballon d'Or score.
#
# WHAT IS FEATURE ENGINEERING?
# - Raw data (goals, assists) needs to be transformed into useful numbers
# - We create new features like "goals_per_90" to measure consistency
# - We add "league_weight" to account for league difficulty
#
# This file can be imported into train.py and predict.py

import pandas as pd

# ========================================
# League Weights - How strong each league is
# ========================================
# Premier League is the hardest (1.0 = 100%)
# Other leagues are slightly easier, so we reduce the weight
LEAGUE_WEIGHTS = {
    "Premier League": 1.0,
    "La Liga": 0.95,
    "Serie A": 0.9,
    "Bundesliga": 0.9,
    "Ligue 1": 0.85,
    "Super Lig": 0.75,
    "Saudi Pro League": 0.7
}


def get_league_weight(league_name):
    """
    Returns the weight for a given league.
    If league not found, returns 0.8 as default.
    
    Example:
        get_league_weight("Premier League") -> 1.0
        get_league_weight("Saudi Pro League") -> 0.7
    """
    if league_name in LEAGUE_WEIGHTS:
        return LEAGUE_WEIGHTS[league_name]
    else:
        return 0.8  # Default for unknown leagues


def calculate_goals_per_90(goals, minutes_played):
    """
    Calculate goals per 90 minutes.
    This shows how often a player scores in a full match.
    
    Formula: (goals / minutes_played) * 90
    
    Example:
        Player with 10 goals in 900 minutes:
        (10 / 900) * 90 = 1.0 goals per 90 minutes
    """
    if minutes_played == 0:
        return 0
    
    goals_per_90 = (goals / minutes_played) * 90
    return round(goals_per_90, 2)


def calculate_assists_per_90(assists, minutes_played):
    """
    Calculate assists per 90 minutes.
    This shows how often a player creates goals.
    
    Formula: (assists / minutes_played) * 90
    """
    if minutes_played == 0:
        return 0
    
    assists_per_90 = (assists / minutes_played) * 90
    return round(assists_per_90, 2)


def add_features_to_dataframe(df):
    """
    Takes a pandas DataFrame and adds calculated features.
    
    Input columns needed:
        - goals, assists, xG, xA, minutes_played, league
    
    Output columns added:
        - goals_per_90, assists_per_90, league_weight
    
    Returns the DataFrame with new columns.
    """
    print("Adding features to data...")
    
    # Calculate goals per 90 for each player
    df["goals_per_90"] = df.apply(
        lambda row: calculate_goals_per_90(row["goals"], row["minutes_played"]),
        axis=1
    )
    
    # Calculate assists per 90 for each player
    df["assists_per_90"] = df.apply(
        lambda row: calculate_assists_per_90(row["assists"], row["minutes_played"]),
        axis=1
    )
    
    # Add league weight for each player
    df["league_weight"] = df["league"].apply(get_league_weight)
    
    print("Features added successfully!")
    print(f"New columns: goals_per_90, assists_per_90, league_weight")
    
    return df


# ========================================
# Test the functions (only runs if you run this file directly)
# ========================================
if __name__ == "__main__":
    # Test with sample data
    print("Testing feature functions...")
    
    # Test goals per 90
    result = calculate_goals_per_90(10, 900)
    print(f"Goals per 90 (10 goals, 900 mins): {result}")
    
    # Test league weight
    result = get_league_weight("Premier League")
    print(f"League weight (Premier League): {result}")
    
    result = get_league_weight("Saudi Pro League")
    print(f"League weight (Saudi Pro League): {result}")
    
    print("\nAll tests passed!")

