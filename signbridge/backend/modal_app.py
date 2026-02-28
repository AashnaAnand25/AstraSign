"""
Modal.com deployment for SignBridge Backend

Deploy with: modal deploy modal_app.py
"""

import modal

# Create a Modal image with all dependencies
image = (
    modal.Image.debian_slim()
    .pip_install_from_requirements("requirements.txt")
    .add_local_file("main.py", "/app/main.py")
    .add_local_dir("routes", "/app/routes")
    .add_local_dir("services", "/app/services")
    .add_local_dir("data", "/app/data")
)

# Create secrets for API keys (set these via Modal dashboard or CLI)
# modal secret create signbridge-secrets GEMINI_API_KEY=xxx WHISPERAI_KEY=xxx ELEVENLABS_API_KEY=xxx SUPERMEMORY_API_KEY=xxx

# Create the Modal app
app = modal.App("signbridge-backend", image=image)


@app.function(
    secrets=[modal.Secret.from_name("signbridge-secrets")],
    cpu=1,
    memory=512,
    timeout=300,  # 5 minutes
    allow_concurrent_inputs=10,  # Handle multiple requests concurrently
)
@modal.asgi_app()
def fastapi_app():
    """Serve the SignBridge FastAPI app on Modal"""
    import os
    import sys
    
    # Add /app to path for imports
    sys.path.insert(0, "/app")
    
    # Import the FastAPI app
    from main import app as fastapi_app
    
    return fastapi_app
