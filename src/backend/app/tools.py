import numpy as np
import h3

import alphashape
from shapely.geometry import mapping

from ..sinr import sinr

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


def generate_prediction(eval_params):
    preds, locs = get_prediction(eval_params)

    # switch lats and longs
    locs[:, [1, 0]] = locs[:, [0, 1]]

    # combine coordinates and predictions
    pred_loc_combined = np.column_stack((locs, preds))
    pred_loc_combined = np.float_(pred_loc_combined)

    # leave only predictions above threshold.
    # threshold should be beatween MIN_THRESHOLD and MAX_THRESHOLD:
    #   (MIN_THRESHOLD <= threshold <= MAX_THRESHOLD)
    threshold = min(
        max(eval_params.get("threshold", MIN_THRESHOLD), MIN_THRESHOLD), MAX_THRESHOLD
    )
    hex_resolution = min(
        max(eval_params.get("hex_resolution", MIN_HEX_RESOLUTION), MIN_HEX_RESOLUTION),
        MAX_HEX_RESOLUTION,
    )

    # if a more detailed HeatMap needed, use `pred_loc_combined` for that
    pred_loc_combined = pred_loc_combined[pred_loc_combined[:, 2] >= threshold]
    coordinates = pred_loc_combined[:, [0, 1]]

    prediction_hexagon_ids = list(
        {h3.geo_to_h3(lat, lon, hex_resolution) for lat, lon in coordinates}
    )

    hull = alphashape.alphashape(coordinates, 1)
    hull_points = list(mapping(hull)["coordinates"])

    annotation_hexagon_ids = {
        "presence": prediction_hexagon_ids,
        "absence": list()
    }

    return dict(
        coordinates=coordinates.tolist(),
        pred_loc_combined=pred_loc_combined.tolist(),
        hull_points=hull_points,
        prediction_hexagon_ids=prediction_hexagon_ids,
        # set prediction_hexagon_ids as the starting point for the annotation
        annotation_hexagon_ids=annotation_hexagon_ids,
    )


def generate_prediction_scores(eval_params):
    preds, locs = get_prediction(eval_params)

    # switch lats and longs
    locs[:, [1, 0]] = locs[:, [0, 1]]

    # combine coordinates and predictions
    pred_loc_combined = np.column_stack((locs, preds))
    pred_loc_combined = np.float_(pred_loc_combined)

    hex_resolution = eval_params['hex_resolution']

    # if a more detailed HeatMap needed, use `pred_loc_combined` for that
    scores_dict={}
    for lat, lon, pred in pred_loc_combined:
        try:
            scores_dict[h3.geo_to_h3(lat, lon, hex_resolution)].append(pred)
        except:
            scores_dict[h3.geo_to_h3(lat, lon, hex_resolution)]=[pred]
    # print(scored_dict)

    return scores_dict
