from sqlalchemy.orm import Session
from . import models


def get_predicted_hexagons(db: Session, eval_params):
    taxa_name = eval_params["taxa_name"]
    taxa_id = int(taxa_name.split("(")[-1][:-1])
    try:
        prediction_id= db.query(models.Prediction).filter(models.Prediction.taxa_id == taxa_id).all()[-1].prediction_id
    except:
        return None
    predicted_hexagons=db.query(models.PredictionHexagon).filter(models.PredictionHexagon.prediction_id == prediction_id).all()
    predicted_hexagons=[predicted_hexagon.hex_index for predicted_hexagon in predicted_hexagons if predicted_hexagon.hex_score>= eval_params['threshold']]
    return predicted_hexagons