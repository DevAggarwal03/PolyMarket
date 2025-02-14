from flask import Flask, request, jsonify
import requests
import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.layers import Dropout
from datetime import datetime, timedelta

app = Flask(__name__)

def fetch_historical_data(coin_id, days=60):
    try:
        response = requests.get(
            f'https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart',  # Changed to market_chart endpoint
            params={
                'vs_currency': 'usd',
                'days': str(days),
                'interval': 'daily'
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"API request failed with status code: {response.status_code}")
            
        data = response.json()
        
        if 'prices' not in data or not data['prices']:
            raise Exception("No price data received from API")
            
        # Extract just the prices from the timestamp-price pairs
        prices = [price[1] for price in data['prices']]
        return np.array(prices)
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching data from CoinGecko: {str(e)}")
    except (KeyError, IndexError) as e:
        raise Exception(f"Error processing API response: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error: {str(e)}")

def calculate_days_until_target(target_date):
    today = datetime.now()
    target = datetime.strptime(target_date, '%Y-%m-%d')
    days_difference = (target - today).days
    return max(1, days_difference)

def predict_price_target(prices, target_price, target_date):
    if len(prices) < 60:
        raise Exception(f"Insufficient historical data. Got {len(prices)} days, need 60 days.")
        
    # Calculate days until target
    days_until_target = calculate_days_until_target(target_date)
    
    # Normalize the data
    mini = np.min(prices)
    maxi = np.max(prices)
    normalized_prices = (prices - mini) / (maxi - mini)
    
    # Prepare data for LSTM
    X, y = [], []
    sequence_length = 45
    
    for i in range(sequence_length, len(prices)):
        X.append(normalized_prices[i-sequence_length:i])
        y.append(normalized_prices[i])
    
    if not X or not y:
        raise Exception("Failed to prepare training data")
        
    X = np.array(X)
    y = np.array(y)
    
    # Reshape for LSTM input
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))

    # Build and train the LSTM model
    model = Sequential()
    model.add(LSTM(100, return_sequences=True, input_shape=(X.shape[1], 1)))
    model.add(Dropout(0.2))
    model.add(LSTM(100, return_sequences=True))
    model.add(Dropout(0.2))
    model.add(LSTM(100))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mean_squared_error')
    
    try:
        model.fit(X, y, epochs=100, batch_size=32, verbose=0)
    except Exception as e:
        raise Exception(f"Error training model: {str(e)}")

    # Make predictions until target date
    predictions = []
    prediction_dates = []
    last_sequence = normalized_prices[-sequence_length:]
    current_date = datetime.now()
    
    for day in range(days_until_target):
        current_sequence = np.reshape(last_sequence, (1, sequence_length, 1))
        next_day_normalized = model.predict(current_sequence, verbose=0)[0][0]
        predictions.append(next_day_normalized)
        last_sequence = np.append(last_sequence[1:], next_day_normalized)
        
        current_date += timedelta(days=1)
        prediction_dates.append(current_date.strftime('%Y-%m-%d'))

    # Denormalize predictions
    denormalized_predictions = [p * (maxi - mini) + mini for p in predictions]
    
    # Calculate metrics
    current_price = prices[-1]
    price_movement_needed = abs(target_price - current_price)
    daily_volatility = np.std(np.diff(prices))
    
    max_reasonable_daily_movement = daily_volatility * 2
    total_possible_movement = max_reasonable_daily_movement * days_until_target
    probability_score = max(0, 1 - (price_movement_needed / total_possible_movement))

    trend_direction = "upward" if target_price > current_price else "downward"
    price_change_needed = abs(((target_price - current_price) / current_price) * 100)
    
    # Calculate trends
    long_term_trend = (prices[-1] - prices[0]) / prices[0] * 100
    medium_term_trend = (prices[-1] - prices[-30]) / prices[-30] * 100
    short_term_trend = (prices[-1] - prices[-7]) / prices[-7] * 100
    
    if (trend_direction == "upward" and (long_term_trend > 0 or medium_term_trend > 0)) or \
       (trend_direction == "downward" and (long_term_trend < 0 or medium_term_trend < 0)):
        probability_score *= 1.2

    return {
        'current_price': float(current_price),  # Convert numpy types to native Python types
        'target_price': float(target_price),
        'target_date': target_date,
        'days_until_target': int(days_until_target),
        'predicted_prices': [(date, float(price)) for date, price in zip(prediction_dates, denormalized_predictions)],
        'max_predicted': float(max(denormalized_predictions)),
        'min_predicted': float(min(denormalized_predictions)),
        'avg_predicted': float(np.mean(denormalized_predictions)),
        'probability_score': float(min(probability_score, 1)),
        'price_change_needed_percent': float(price_change_needed),
        'trend_direction': trend_direction,
        'daily_volatility': float(daily_volatility),
        'trend_analysis': {
            'long_term_trend': f"{float(long_term_trend):.2f}%",
            'medium_term_trend': f"{float(medium_term_trend):.2f}%",
            'short_term_trend': f"{float(short_term_trend):.2f}%"
        },
        'analysis': {
            'trend_strength': 'strong' if probability_score > 0.7 else 'moderate' if probability_score > 0.4 else 'weak',
            'volatility_level': 'high' if daily_volatility > np.mean(prices) * 0.02 else 'moderate' if daily_volatility > np.mean(prices) * 0.01 else 'low',
            'time_feasibility': 'favorable' if days_until_target >= 7 else 'challenging' if days_until_target >= 3 else 'very challenging'
        }
    }

@app.route('/predict', methods=['GET'])
def predict():
    coin_id = request.args.get('coin_id', default='bitcoin', type=str)
    target_price = request.args.get('target_price', type=float)
    target_date = request.args.get('target_date', type=str)
    
    if not all([target_price, target_date]):
        return jsonify({'error': 'Target price and date must be provided'}), 400
    
    try:
        datetime.strptime(target_date, '%Y-%m-%d')
        historical_prices = fetch_historical_data(coin_id)
        prediction_results = predict_price_target(historical_prices, target_price, target_date)
        return jsonify(prediction_results)
    except ValueError as e:
        return jsonify({'error': 'Invalid date format. Please use YYYY-MM-DD'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)