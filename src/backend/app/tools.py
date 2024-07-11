import numpy as np
import json
import os
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


def save_preds(taxa_name, preds, locs):
    # TODO save to DB
    directory = "predictions"
    if not os.path.exists(directory):
        os.makedirs(directory)
    np.save(f"{directory}/{taxa_name}_preds", preds)
    np.save(f"{directory}/{taxa_name}_locs", locs)


def get_prediction(eval_params):
    # TODO get preds from DB
    taxa_name = eval_params["taxa_name"]
    taxa_id = get_taxa_id_by_name(taxa_name)
    eval_params["taxa_id"] = taxa_id
    preds_file = f"predictions/{taxa_name}_preds.npy"
    locs_file = f"predictions/{taxa_name}_locs.npy"

    if os.path.isfile(preds_file) and os.path.isfile(locs_file):
        print(f"Loading saved predictions for Taxa: {taxa_name}")
        return np.load(preds_file), np.load(locs_file)

    print(f"Starting generate predictions for Taxa: {taxa_name}.\nParams {eval_params}")
    preds, locs = sinr.generate_prediction(eval_params)
    save_preds(taxa_name, preds, locs)
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

    saved_annotation = load_annotation(eval_params)

    return dict(
        coordinates=coordinates.tolist(),
        pred_loc_combined=pred_loc_combined.tolist(),
        hull_points=hull_points,
        prediction_hexagon_ids=prediction_hexagon_ids,
        # If there are no saved annotations, set prediction_hexagon_ids as the starting point for the annotation
        annotation_hexagon_ids=saved_annotation["annotation_hexagon_ids"]
        or prediction_hexagon_ids,
    )


def save_annotation(data):
    taxa_name = data["taxa_name"]
    annotation_hexagon_ids = data["annotation_hexagon_ids"]
    directory = "annotations"
    if not os.path.exists(directory):
        os.makedirs(directory)
    with open(f"{directory}/{taxa_name}.json", "w") as f:
        json.dump(annotation_hexagon_ids, f)
    print(f"Saving annotation for {taxa_name}.")
    return {"annotation_hexagon_ids": annotation_hexagon_ids}


def load_annotation(data):
    directory = "annotations"
    taxa_name = data["taxa_name"]
    annotation_file = f"{directory}/{taxa_name}.json"
    if os.path.isfile(annotation_file):
        with open(annotation_file) as f:
            annotation = json.load(f)
        return {"annotation_hexagon_ids": annotation}
    return {"annotation_hexagon_ids": []}
