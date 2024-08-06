import numpy as np
import h3
from datetime import datetime

from ..sinr import sinr
from .db import models

MIN_THRESHOLD = 0.1
MAX_THRESHOLD = 0.9
MIN_HEX_RESOLUTION = 1
MAX_HEX_RESOLUTION = 5


def get_taxa_id_by_name(taxa_name: str):
    """Returns the Taxa ID from the title, assuming the title is in format `taxa_name (taxa_id)`.

    >>> get_taxa_id_by_name("Ranunculus alpestris (130712)")
    130712
    """
    return int(taxa_name.split("(")[-1][:-1])

def get_prediction(eval_params):
    # TODO get preds from DB
    taxa_name = eval_params["taxa_name"]
    taxa_id = get_taxa_id_by_name(taxa_name)
    eval_params["taxa_id"] = taxa_id

    print(f"Starting generate predictions for Taxa: {taxa_name}.\nParams {eval_params}")
    preds, locs = sinr.generate_prediction(eval_params)
    # save_preds(taxa_name, preds, locs)
    return preds, locs


def generate_prediction_scores(eval_params, lowest_threshold=0.0001):
    preds, locs = get_prediction(eval_params)

    # switch lats and longs
    locs[:, [1, 0]] = locs[:, [0, 1]]

    # combine coordinates and predictions
    pred_loc_combined = np.column_stack((locs, preds))
    pred_loc_combined = np.float_(pred_loc_combined)
    pred_loc_combined = pred_loc_combined[pred_loc_combined[:, 2] >= lowest_threshold]
    hex_resolution = eval_params['hex_resolution']

    # if a more detailed HeatMap needed, use `pred_loc_combined` for that
    scores_dict={}
    for lat, lon, pred in pred_loc_combined:
        try:
            scores_dict[h3.geo_to_h3(lat, lon, hex_resolution)].append(pred)
        except Exception:
            scores_dict[h3.geo_to_h3(lat, lon, hex_resolution)]=[pred]
    hex_indexes=[]
    hex_scores=[]
    for key in scores_dict:
        hex_indexes.append(key)
        hex_scores.append(max(scores_dict[key]))
    
    index_score_combined = np.column_stack((hex_indexes, hex_scores))

    return index_score_combined


def populate_prediction_database(eval_params,db):
    index_score_combined = generate_prediction_scores(eval_params)

    prediction_model = models.Prediction()
    prediction_model.taxa_id = eval_params["taxa_id"]
    prediction_model.created_at = datetime.now()
    db.add(prediction_model)
    db.commit()

    for index_score in index_score_combined:
        prediction_hexagon_model = models.PredictionHexagon()
        prediction_hexagon_model.prediction_id = prediction_model.prediction_id
        prediction_hexagon_model.hex_index = index_score[0]
        prediction_hexagon_model.hex_score = index_score[1]
        db.add(prediction_hexagon_model)
    db.commit()    

    return index_score_combined

def populate_prediction_database_all_taxas(db, path_to_taxa_ids):
    taxa_ids = []
    taxa_names = []

    with open(path_to_taxa_ids, 'r') as file:
        for line in file:
            parts = line.strip().split('\t')
            taxa_ids.append(int(parts[0]))
            taxa_names.append(parts[1])
        
    for i in range(len(taxa_ids)):
        eval_params= {'taxa_name': f"{taxa_names[i]} ({taxa_ids[i]})", 'hex_resolution': 4, 'model': 'AN_FULL_max_1000', 'disable_ocean_mask': False, 'taxa_id': taxa_ids[i]}
        populate_prediction_database(eval_params, db)


def get_predicted_hexagons(db, eval_params):
    taxa_name = eval_params["taxa_name"]
    taxa_id = int(taxa_name.split("(")[-1][:-1])
    try:
        prediction_id= db.query(models.Prediction).filter(models.Prediction.taxa_id == taxa_id).all()[-1].prediction_id
    except Exception:
        return None
    predicted_hexagons=db.query(models.PredictionHexagon).filter(models.PredictionHexagon.prediction_id == prediction_id).all()
    predicted_hexagons=[predicted_hexagon.hex_index for predicted_hexagon in predicted_hexagons if predicted_hexagon.hex_score>= eval_params['threshold']]
    return predicted_hexagons