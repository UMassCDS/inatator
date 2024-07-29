from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from sqlalchemy.orm import Session
import os

from . import tools
from .db import models
from .db.database import engine, SessionLocal, check_db_connection

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

def get_db():
    with SessionLocal() as db:
        yield db

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
    if check_db_connection(engine):
        return {"status": "healthy"}
    else:
        return {"status": "unhealthy"}

@app.post("/generate_prediction/")
async def generate_prediction(request: Request):
    response = tools.generate_prediction(await request.json())
    return JSONResponse(content=response)

@app.post("/load_annotation/")
async def load_annotation(request: Request):
    response = tools.load_annotation(await request.json())
    return JSONResponse(content=response)

@app.post("/save_annotation/")
async def save_annotation(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    taxa_id = tools.get_taxa_id_by_name(body["taxa_name"])

    annotation_model = models.Annotation()
    annotation_model.taxa_id = taxa_id
    annotation_model.created_at = datetime.now()
    db.add(annotation_model)
    db.commit()

    hex_indexes = body["annotation_hexagon_ids"]
    for hex_index in hex_indexes:
        hexagon_model = models.AnnotationHexagon()
        hexagon_model.annotation_id = annotation_model.annotation_id
        hexagon_model.hex_id = hex_index
        db.add(hexagon_model)
    db.commit()    

    return JSONResponse(content={})