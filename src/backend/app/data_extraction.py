import pandas as pd
import h3
import shapely
import pyproj
import numpy as np

from . import tools

PARAMS = {"sampling_mode": "circle", "max_amount": 7}  # polygon | circle


def sample_points(taxa_name, annotation_hexagons, hex_resolution, params=PARAMS):
    taxon_id = tools.get_taxa_id_by_name(taxa_name)
    hex_index = []
    hex_type = []
    presence_hexes = annotation_hexagons["presence"]
    absence_hexes = annotation_hexagons["absence"]

    psuedo_points = []
    # enumerate lists by type, if more types are added consider using a dict and one-hot encoding
    for hex_type, hexes in enumerate([absence_hexes, presence_hexes]):
        for hex_id in hexes:
            # sample psuedo-points for each hex
            hex_boundary = h3.h3_to_geo_boundary(hex_id, geo_json=False)
            random_n_points = None
            N = max(params["max_amount"] - hex_resolution, 0) + 1
            if params["sampling_mode"] == "polygon":
                random_n_points = generate_random_points_in_polygon(hex_boundary, N)
            else:
                lat, lng = h3.h3_to_geo(hex_id)
                random_n_points = generate_random_points_in_circle(
                    lat, lng, hex_resolution, N
                )

            for random_lat, random_lng in random_n_points:
                psuedo_points.append(
                    {
                        "taxon_id": taxon_id,
                        "hex_type": hex_type,
                        "latitude": random_lat,
                        "longitude": random_lng,
                    }
                )
    return pd.DataFrame(psuedo_points)


def calculate_geo_distance(loc1, loc2):
    lat1, lng1 = loc1
    lat2, lng2 = loc2

    geod = pyproj.Geod(ellps="WGS84")
    _, _, distance = geod.inv(lons1=lng1, lats1=lat1, lons2=lng2, lats2=lat2)
    return distance


def generate_random_points_in_polygon(boundary, N):
    polygon = shapely.Polygon(boundary)
    min_alt, min_lng, max_alt, max_lng = polygon.bounds

    random_points = []
    while len(random_points) < N:
        alt = np.random.uniform(min_alt, max_alt)
        lng = np.random.uniform(min_lng, max_lng)

        point = shapely.Point(alt, lng)
        if polygon.contains(point):
            random_points.append((alt, lng))

    return random_points


def generate_random_points_in_circle(lat, lng, R, N):
    random_points = []
    while len(random_points) < N:
        r = R * np.sqrt(np.random.uniform(0, 1))  # random distance from center
        theta = np.random.uniform(0, 2 * np.pi)  # random degree

        # 111320m distance between longitudes and latitudes at the equator
        x = lng + r * np.cos(theta) / (
            111320 * np.cos(lat * np.pi / 180)
        )  # r * np.cos(theta) / / (111320 * np.cos(lat * np.pi / 180)) finds the random point in x axis, division adjusts for length in the poles
        y = lat + r * np.sin(theta) / 111320

        random_points.append((y, x))

    return random_points
