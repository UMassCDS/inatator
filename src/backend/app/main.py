import os
from copy import deepcopy
from datetime import datetime

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from . import tools
from .db import models
from .db.database import SessionLocal, check_db_connection, engine

DEFAULT_ANNOTATION_HEXAGON_IDS = {"annotation_hexagon_ids": {"presence": [], "absence": []}}


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


@app.post("/save_annotation/")
async def save_annotation(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    taxa_id = tools.get_taxa_id_by_name(body["taxa_name"])

    annotation_model = models.Annotation()
    annotation_model.taxa_id = taxa_id
    annotation_model.created_at = datetime.now()
    db.add(annotation_model)
    db.commit()

    for hex_type, hex_indexes in body["annotation_hexagon_ids"].items():
        for hex_index in hex_indexes:
            hexagon_model = models.AnnotationHexagon(
                annotation_id=annotation_model.annotation_id,
                hex_index=hex_index,
                hex_type=hex_type,
            )
            db.add(hexagon_model)
    db.commit()

    return JSONResponse(content={})


@app.post("/load_annotation/")
async def load_annotation(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    taxa_id = tools.get_taxa_id_by_name(body["taxa_name"])

    # Query for the latest annotation for the given taxa_id
    latest_annotation = (
        db.query(models.Annotation)
        .filter(models.Annotation.taxa_id == taxa_id)
        .order_by(models.Annotation.created_at.desc())
        .first()
    )
    annotation_hexagons = deepcopy(DEFAULT_ANNOTATION_HEXAGON_IDS)

    if not latest_annotation:
        return JSONResponse(content=annotation_hexagons)

    # Query for the hexagons associated with the latest annotation
    hexagons = (
        db.query(models.AnnotationHexagon)
        .filter(models.AnnotationHexagon.annotation_id == latest_annotation.annotation_id)
        .all()
    )

    for hexagon in hexagons:
        if hexagon.hex_type not in annotation_hexagons["annotation_hexagon_ids"]:
            annotation_hexagons["annotation_hexagon_ids"][hexagon.hex_type] = []
        annotation_hexagons["annotation_hexagon_ids"][hexagon.hex_type].append(hexagon.hex_index)
    return JSONResponse(content=annotation_hexagons)

def populate_prediction_database(db):
    eval_params= {'taxa_name': 'Libertia chilensis (59941)', 'hex_resolution': 4, 'threshold': 0.1, 'model': 'AN_FULL_max_1000', 'disable_ocean_mask': False, 'taxa_id': 59941}
    scores_dict = tools.generate_prediction_scores(eval_params)

    prediction_model = models.Prediction()
    prediction_model.taxa_id = eval_params["taxa_id"]
    db.add(prediction_model)
    db.commit()

    for key in scores_dict:
        prediction_hexagon_model = models.PredictionHexagon()
        prediction_hexagon_model.prediction_id = prediction_model.prediction_id
        print('key', key, max(scores_dict[key]))
        prediction_hexagon_model.hex_index = key
        prediction_hexagon_model.hex_score = max(scores_dict[key])
        db.add(prediction_hexagon_model)
    db.commit()    

db = next(get_db())
populate_prediction_database(db)