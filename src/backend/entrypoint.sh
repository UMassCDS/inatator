#!/bin/bash
source /opt/conda/etc/profile.d/conda.sh
conda activate inatator

# Run the FastAPI server
exec uvicorn src.backend.app.main:app --host 0.0.0.0 --port 8000
