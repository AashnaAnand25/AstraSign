# AstraSign - ASL Translation System

Advanced ASL translation system with real-time sign detection and 3D avatar animation.

## Features

- **Audio → ASL**: Speak naturally and see sign translations in real-time
- **ASL → Audio**: Show signs and hear voice output with text-to-speech
- **3D Avatar System**: Interactive 3D characters performing ASL signs
- **Real-time Processing**: Live transcription and sign detection

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start everything** (frontend + backend, creates the Python venv for you):
   ```bash
   ./run.sh          # or ./run.sh --front for the frontend alone
   ```

3. **Access the application**:
   Open `http://localhost:8080` in your browser

The backend is optional. Sign detection, the 3D avatar and English->ASL gloss
all run in the browser; without a backend the app falls back to the device's
own speech synthesis and local grammar rules.

## Project Structure

- `src/components/astraign/` - React components for ASL features
- `src/services/` - ML model services and API integrations
- `src/data/` - ASL signs database and training data
- `signbridge/backend/` - FastAPI backend for transcription and TTS (optional)
- `public/models/` - 3D model files for avatars

## Technology Stack

- **Frontend**: React + TypeScript + Three.js + TensorFlow.js
- **Backend**: FastAPI with Python
- **3D Rendering**: Three.js with React Three Fiber
- **UI**: Shadcn/ui with Tailwind CSS

## Configuration

### Environment Variables

Backend keys — create `signbridge/backend/.env` (only `GEMINI_API_KEY` is
required; each other key enables one endpoint):

```env
GEMINI_API_KEY=your_gemini_key          # required: grammar + recognition
WHISPERAI_KEY=your_openai_key           # optional: /api/transcribe
ELEVENLABS_API_KEY=your_elevenlabs_key  # optional: /api/speak
```

Frontend — set `VITE_API_URL` to your deployed backend's origin, or leave it
unset to run fully client-side. See `.env.example`.

### Recognition

Sign recognition is rule-based geometry over MediaPipe hand landmarks
(`src/services/AslEngine.ts`), not a trained network. The TensorFlow.js
wrapper in `src/services/ASLModelService.ts` is present but unused.

## Usage

### Audio → ASL Translation

1. Click the "Audio → ASL" tab
2. Select your preferred detection model
3. Click the microphone button to start recording
4. Speak naturally and watch the ASL translation appear
5. Use the play button to see avatar animations

### ASL → Audio Translation

1. Click the "ASL → Audio" tab
2. Enable camera access
3. Start sign detection
4. Show ASL signs to the camera
5. Listen to the voice output

### Avatar System

1. Click the "Avatar" tab
2. Choose your preferred avatar model and environment
3. Select signs to animate or use quick actions
4. Control playback speed and camera settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the AstraSign team.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
