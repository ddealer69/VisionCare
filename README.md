# VisionCare

A full-stack eye tracking and blink detection application built with Vite + React + TailwindCSS (frontend) and Python Flask (backend). VisionCare provides real-time blink detection using OpenCV.js, eye health analysis via Roboflow API, and comprehensive session logging.

## Features

### 🎥 Real-time Video Processing
- Webcam feed integration with live video streaming
- OpenCV.js-powered blink detection using Eye Aspect Ratio (EAR)
- Real-time eye tracking and analysis

### 📊 Live Statistics Dashboard
- Total blink count tracking
- Blinks per minute (BPM) calculation
- Blink rate status (low/normal/high) with health recommendations
- Session duration tracking

### 📈 Data Visualization
- Interactive Recharts graphs showing blink rate over time
- Real-time data updates with smooth animations
- Multiple data series (BPM and total blinks)

### 🔍 AI-Powered Analysis
- Eye redness detection using Roboflow API
- Emotion analysis for fatigue detection
- Automated health insights

### 💾 Session Management
- JSON-based session logging
- Session history with detailed analytics
- Export capabilities for data analysis

### 🎨 Modern UI/UX
- Responsive dashboard design
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Clean, professional interface

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for modern styling
- **Recharts** for data visualization
- **OpenCV.js** for computer vision
- **Axios** for API communication

### Backend
- **Python Flask** REST API
- **Flask-CORS** for cross-origin requests
- **Roboflow API** integration
- **JSON** file-based session storage
- **Python-dotenv** for environment management

## Project Structure

```
VisionCare/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.tsx # Main dashboard layout
│   │   │   ├── WebcamFeed.tsx # Video feed with detection
│   │   │   ├── StatsPanel.tsx # Statistics display
│   │   │   ├── BlinkChart.tsx # Data visualization
│   │   │   └── SessionLogs.tsx # Session management
│   │   ├── contexts/         # React contexts
│   │   │   └── SessionContext.tsx # Session state management
│   │   ├── hooks/           # Custom React hooks
│   │   │   └── useBlinkDetection.ts # Blink detection logic
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/           # Utility functions
│   │   │   └── api.ts       # API service layer
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/                 # Python Flask backend
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example       # Environment variables template
│   └── session_logs/      # JSON session storage
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Modern web browser with webcam access

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Roboflow API key
```

5. Start the Flask server:
```bash
python app.py
```

The backend API will be available at `http://localhost:5000`

## Usage

1. **Start Both Servers**: Ensure both frontend and backend servers are running
2. **Grant Camera Permission**: Allow browser access to your webcam
3. **Start Session**: Click "Start Session" to begin eye tracking
4. **Monitor Stats**: View real-time statistics in the right panel
5. **Analyze Data**: Check the graph for blink rate trends
6. **View Logs**: Toggle the logs sidebar to see session history
7. **Stop Session**: Click "Stop Session" to save data

## API Endpoints

### Session Management
- `GET /api/health` - Health check
- `POST /api/session/start` - Start new session
- `POST /api/session/log-blink` - Log blink data
- `POST /api/session/save` - Save current session
- `GET /api/sessions` - Get all sessions
- `GET /api/session/<id>` - Get session details

### Analysis
- `POST /api/analyze/eye-redness` - Analyze eye redness
- `POST /api/analyze/emotion` - Analyze facial emotion

## Configuration

### Environment Variables (Backend)
- `ROBOFLOW_API_KEY`: Your Roboflow API key for AI analysis
- `FLASK_ENV`: Development/production environment
- `FLASK_DEBUG`: Enable debug mode
- `API_PORT`: Server port (default: 5000)
- `API_HOST`: Server host (default: 0.0.0.0)

### OpenCV.js Integration
The application automatically loads OpenCV.js from CDN. For offline usage, download the library locally and update the script source in the blink detection hook.

## Blink Detection Algorithm

The application uses the Eye Aspect Ratio (EAR) method for blink detection:

1. **Face Detection**: Identifies face region in video stream
2. **Eye Landmark Detection**: Locates eye corner and eyelid points
3. **EAR Calculation**: Computes ratio of eye height to width
4. **Blink Threshold**: Detects blinks when EAR drops below threshold
5. **Statistics**: Calculates BPM and tracks patterns

## Health Insights

- **Normal Blink Rate**: 12-20 blinks per minute
- **Low Rate Warning**: May indicate dry eyes or concentration
- **High Rate Warning**: Could suggest fatigue or eye strain
- **Recommendations**: Regular breaks, hydration, proper lighting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenCV.js for computer vision capabilities
- Roboflow for AI-powered analysis
- React and Flask communities for excellent documentation
- TailwindCSS for beautiful styling utilities