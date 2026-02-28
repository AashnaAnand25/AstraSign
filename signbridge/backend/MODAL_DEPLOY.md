# Modal.com Deployment Guide

## Deploy SignBridge Backend to Modal.com

### Prerequisites
1. Install Modal CLI: `pip install modal`
2. Set up Modal account: https://modal.com
3. Authenticate: `modal token new`

### Step 1: Create Modal Secrets

Set your API keys as Modal secrets (securely stored in Modal's infrastructure):

```bash
cd signbridge/backend

modal secret create signbridge-secrets \
  GEMINI_API_KEY=your-gemini-key \
  WHISPERAI_KEY=your-openai-key \
  OPENAI_API_KEY=your-openai-key \
  ELEVENLABS_API_KEY=your-elevenlabs-key \
  SUPERMEMORY_API_KEY=your-supermemory-key
```

Replace the placeholder values with your actual API keys from `.env`.

### Step 2: Deploy

```bash
cd signbridge/backend
modal deploy modal_app.py
```

Modal will output a URL like: `https://yourname--signbridge-backend-fastapi-app.modal.run`

### Step 3: Update Frontend

Update your frontend to use the Modal URL:

Edit `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://yourname--signbridge-backend-fastapi-app.modal.run';
```

Or set up CORS in the Modal app and use the Vite proxy during development.

### Benefits of Modal

- **Serverless**: Only pay for compute time used
- **Auto-scaling**: Handles traffic spikes automatically
- **GPU support**: Can add GPU acceleration if needed later
- **Persistent URLs**: App stays deployed until you delete it
- **Secrets management**: API keys securely stored, never in code

### Local Development vs Modal

| Mode | Command | URL |
|------|---------|-----|
| Local | `uvicorn main:app --reload` | `http://localhost:8000` |
| Modal Dev | `modal serve modal_app.py` | Temporary URL |
| Modal Prod | `modal deploy modal_app.py` | Permanent URL |

### Troubleshooting

- **429 errors**: Gemini API rate limit - wait a moment and retry
- **404 errors**: Check that `signbridge-secrets` is created with correct keys
- **CORS errors**: Update `ALLOWED_ORIGINS` in Modal secrets to include your frontend URL
