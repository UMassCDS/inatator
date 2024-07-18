from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from . import tools
from .db import crud

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    print(os.getenv("DATABASE_URL"))
    if crud.check_db_connection():
        return {"status": "healthy"}
    else:
        return {"status": "unhealthy"}

@app.get("/echo_env/")
async def echo_env():
    return {"url": os.environ.get("DATABASE_URL", "ERROR"), "env": dict(os.environ)}

@app.post("/generate_prediction/")
async def generate_prediction(request: Request):
    response = tools.generate_prediction(await request.json())
    return JSONResponse(content=response)

@app.post("/save_annotation/")
async def save_annotation(request: Request):
    response = tools.save_annotation(await request.json())
    return JSONResponse(content=response)
