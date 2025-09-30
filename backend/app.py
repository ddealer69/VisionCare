import os
import json
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
ROBOFLOW_API_KEY = os.getenv('ROBOFLOW_API_KEY', 'your-roboflow-api-key')
LOGS_DIR = 'session_logs'

# Ensure logs directory exists
os.makedirs(LOGS_DIR, exist_ok=True)

class SessionLogger:
    def __init__(self):
        self.session_id = None
        self.session_data = {
            'session_id': '',
            'start_time': '',
            'blink_data': [],
            'analysis_results': [],
            'stats': {
                'total_blinks': 0,
                'average_bpm': 0,
                'session_duration': 0
            }
        }
    
    def start_session(self):
        """Start a new session"""
        self.session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.session_data = {
            'session_id': self.session_id,
            'start_time': datetime.now().isoformat(),
            'blink_data': [],
            'analysis_results': [],
            'stats': {
                'total_blinks': 0,
                'average_bpm': 0,
                'session_duration': 0
            }
        }
        return self.session_id
    
    def log_blink_data(self, blink_count, bpm, ear_values):
        """Log blink detection data"""
        timestamp = datetime.now().isoformat()
        blink_entry = {
            'timestamp': timestamp,
            'blink_count': blink_count,
            'bpm': bpm,
            'ear_values': ear_values
        }
        self.session_data['blink_data'].append(blink_entry)
        self.session_data['stats']['total_blinks'] = blink_count
        self.session_data['stats']['average_bpm'] = bpm
    
    def log_analysis_result(self, analysis_type, result):
        """Log analysis results from Roboflow"""
        timestamp = datetime.now().isoformat()
        analysis_entry = {
            'timestamp': timestamp,
            'type': analysis_type,
            'result': result
        }
        self.session_data['analysis_results'].append(analysis_entry)
    
    def save_session(self):
        """Save session data to JSON file"""
        if self.session_id:
            # Calculate session duration
            start_time = datetime.fromisoformat(self.session_data['start_time'])
            duration = (datetime.now() - start_time).total_seconds()
            self.session_data['stats']['session_duration'] = duration
            
            # Save to file
            filename = f"{LOGS_DIR}/{self.session_id}.json"
            with open(filename, 'w') as f:
                json.dump(self.session_data, f, indent=2)
            return filename
        return None

# Global session logger
session_logger = SessionLogger()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'VisionCare API is running'})

@app.route('/api/session/start', methods=['POST'])
def start_session():
    """Start a new session"""
    session_id = session_logger.start_session()
    return jsonify({'session_id': session_id, 'message': 'Session started'})

@app.route('/api/session/log-blink', methods=['POST'])
def log_blink_data():
    """Log blink detection data"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    blink_count = data.get('blinkCount', 0)
    bpm = data.get('bpm', 0)
    ear_values = data.get('earValues', [])
    
    session_logger.log_blink_data(blink_count, bpm, ear_values)
    
    return jsonify({
        'message': 'Blink data logged',
        'session_id': session_logger.session_id
    })

@app.route('/api/analyze/eye-redness', methods=['POST'])
def analyze_eye_redness():
    """Analyze eye redness using Roboflow API"""
    try:
        # Get image data from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        
        # Mock response for now since we don't have actual Roboflow API key
        # In production, you would call the actual Roboflow API
        mock_result = {
            'predictions': [
                {
                    'class': 'normal',
                    'confidence': 0.85,
                    'redness_level': 'low'
                }
            ],
            'inference_time': 0.23
        }
        
        # Log the analysis result
        session_logger.log_analysis_result('eye_redness', mock_result)
        
        return jsonify({
            'result': mock_result,
            'message': 'Eye redness analysis completed'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze/emotion', methods=['POST'])
def analyze_emotion():
    """Analyze emotion using Roboflow API"""
    try:
        # Get image data from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        
        # Mock response for now since we don't have actual Roboflow API key
        # In production, you would call the actual Roboflow API
        mock_result = {
            'predictions': [
                {
                    'class': 'neutral',
                    'confidence': 0.78,
                    'emotions': {
                        'neutral': 0.78,
                        'happy': 0.15,
                        'tired': 0.07
                    }
                }
            ],
            'inference_time': 0.31
        }
        
        # Log the analysis result
        session_logger.log_analysis_result('emotion', mock_result)
        
        return jsonify({
            'result': mock_result,
            'message': 'Emotion analysis completed'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/session/save', methods=['POST'])
def save_session():
    """Save current session data"""
    filename = session_logger.save_session()
    if filename:
        return jsonify({
            'message': 'Session saved successfully',
            'filename': filename,
            'session_id': session_logger.session_id
        })
    else:
        return jsonify({'error': 'No active session to save'}), 400

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get list of all saved sessions"""
    try:
        sessions = []
        for filename in os.listdir(LOGS_DIR):
            if filename.endswith('.json'):
                filepath = os.path.join(LOGS_DIR, filename)
                with open(filepath, 'r') as f:
                    session_data = json.load(f)
                    sessions.append({
                        'session_id': session_data.get('session_id'),
                        'start_time': session_data.get('start_time'),
                        'stats': session_data.get('stats', {}),
                        'filename': filename
                    })
        
        # Sort by start time (newest first)
        sessions.sort(key=lambda x: x['start_time'], reverse=True)
        
        return jsonify({'sessions': sessions})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session_details(session_id):
    """Get detailed data for a specific session"""
    try:
        filename = f"{LOGS_DIR}/{session_id}.json"
        if not os.path.exists(filename):
            return jsonify({'error': 'Session not found'}), 404
        
        with open(filename, 'r') as f:
            session_data = json.load(f)
        
        return jsonify(session_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting VisionCare API server...")
    print("Available endpoints:")
    print("  GET  /api/health - Health check")
    print("  POST /api/session/start - Start new session")
    print("  POST /api/session/log-blink - Log blink data")
    print("  POST /api/analyze/eye-redness - Analyze eye redness")
    print("  POST /api/analyze/emotion - Analyze emotion")
    print("  POST /api/session/save - Save session data")
    print("  GET  /api/sessions - Get all sessions")
    print("  GET  /api/session/<id> - Get session details")
    
    app.run(debug=True, host='0.0.0.0', port=5000)