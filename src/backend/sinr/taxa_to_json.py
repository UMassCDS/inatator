import json
from pathlib import Path


def taxa_metadata_to_json(file_path):
    """ Сonverts the names of TAXA from the txt files into JSON.
    JSON file use in the drop-down list in the TAXA name selection form in the web app.
    """
    cur_path = get_cur_path()
    taxa_names_file = open(cur_path + file_path, "r")
    data = taxa_names_file.read().split("\n")
    data = [dd for dd in data if dd != '']
    taxa_ids = []
    taxa_names = []
    for tt in range(len(data)):
        id, nm = data[tt].split('\t')
        # taxa_ids.append(int(id))
        taxa_names.append(f'{nm} ({id})')
    taxa_names_file.close()
    taxa_names_json_file = open(cur_path + '/taxa_names.json', 'w')
    json.dump(taxa_names, taxa_names_json_file)
    return dict(zip(taxa_ids, taxa_names))


def get_cur_path():
    return str(Path(__file__).parent)

taxa_metadata_to_json('/taxa_02_08_2023_names.txt')