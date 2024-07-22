from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from sqlalchemy.orm import Session
import os

from . import tools
from .db import models, crud
from .db.database import engine, SessionLocal

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

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
async def save_annotation(request: Request, db: Session = Depends(get_db)):
    # response = tools.save_annotation(await request.json())
    body = await request.json()
    taxa_id = int(body["taxa_name"].split("(")[-1][:-1])

    annotation_model = models.Annotation()
    annotation_model.TaxaID = taxa_id
    annotation_model.CreatedAt = datetime.now()
    db.add(annotation_model)
    db.commit()

    hex_indexes = body["annotation_hexagon_ids"]
    for hex_index in hex_indexes:
        hexagon_model = models.AnnotationHexagon()
        hexagon_model.AnnotationID = annotation_model.AnnotationID
        hexagon_model.HexID = hex_index
        db.add(hexagon_model)
    db.commit()    

    return JSONResponse(content={})
