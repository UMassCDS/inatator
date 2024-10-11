import os
from copy import deepcopy
from datetime import datetime

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session

from . import tools
from . import data_extraction
from .db import models
from .db.database import SessionLocal, check_db_connection, engine

DEFAULT_ANNOTATION_HEXAGON_IDS = {
    "annotation_hexagon_ids": {"presence": [], "absence": []}
}


app = FastAPI()
models.Base.metadata.create_all(bind=engine)


def get_db():
    with SessionLocal() as db:
        yield db


origins = ["*"]

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
async def generate_prediction(request: Request, db: Session = Depends(get_db)):
    eval_params = await request.json()
    predicted_hexagons = tools.get_predicted_hexagons(db, eval_params=eval_params)
    if predicted_hexagons is None:
        index_score_combined = tools.populate_prediction_database(eval_params, db)
        indexes = index_score_combined[:, 0]
        scores = [float(i) for i in index_score_combined[:, 1]]
        predicted_hexagons = [
            indexes[i]
            for i in range(len(indexes))
            if scores[i] >= eval_params["threshold"]
        ]

    annotation_hexagon_ids = {"presence": predicted_hexagons, "absence": list()}

    if len(predicted_hexagons) == 0:
        response = dict(annotation_hexagon_ids=annotation_hexagon_ids)

    else:
        response = dict(
            prediction_hexagon_ids=predicted_hexagons,
            annotation_hexagon_ids=annotation_hexagon_ids,
        )

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
        .filter(
            models.AnnotationHexagon.annotation_id == latest_annotation.annotation_id
        )
        .all()
    )

    for hexagon in hexagons:
        if hexagon.hex_type not in annotation_hexagons["annotation_hexagon_ids"]:
            annotation_hexagons["annotation_hexagon_ids"][hexagon.hex_type] = []
        annotation_hexagons["annotation_hexagon_ids"][hexagon.hex_type].append(
            hexagon.hex_index
        )
    return JSONResponse(content=annotation_hexagons)


@app.post("/sample_annotation/")
async def sample_annotation(request: Request):
    """
    taxa_name: string,
    hex_resolution: integer,
    threshold: float,
    model: string,
    disable_ocean_mask: _,
    annotation_hexagon_ids: dict<dict<list<h3ID>>>
    """
    body = await request.json()

    taxa_name = body["taxa_name"]
    annotation_hexagon_ids = body["annotation_hexagon_ids"]
    hex_resolution = body["hex_resolution"]

    points_df = data_extraction.sample_points(
        taxa_name, annotation_hexagon_ids, hex_resolution
    )

    return StreamingResponse(
        iter([points_df.to_csv(index=False)]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=annotation.csv"},
    )


# path_to_taxa_ids='src/backend/sinr/web_app/taxa_02_08_2023_names.txt'

# tools.populate_prediction_database_all_taxas(db = next(get_db()), path_to_taxa_ids=path_to_taxa_ids)
