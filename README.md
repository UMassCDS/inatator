# Data Science for the Common Good 2024
# iNaturalist GeoModel Annotator Project

Code repository for 2024 Data Science for the Common Good project with iNaturalist. 

Collaborators: Angela Zhu, Paula Navarrete, Sergei Pogorelov, Ozel Yilmazel 

## Spatial Implicit Neural Representations for Global-Scale Species Mapping - ICML 2023

This code enables the recreation of the results from our ICML 2023 paper [Spatial Implicit Neural Representations for Global-Scale Species Mapping](https://arxiv.org/abs/2306.02564). 

## 🌍 Overview 
Estimating the geographical range of a species from sparse observations is a challenging and important geospatial prediction problem. Given a set of locations where a species has been observed, the goal is to build a model to predict whether the species is present or absent at any location. In this work, we use Spatial Implicit Neural Representations (SINRs) to jointly estimate the geographical range of thousands of species simultaneously. SINRs scale gracefully, making better predictions as we increase the number of training species and the amount of training data per species. We introduce four new range estimation and spatial representation learning benchmarks, and we use them to demonstrate that noisy and biased crowdsourced data can be combined with implicit neural representations to approximate expert-developed range maps for many species.

# Getting Started

## :hatched_chick: Installation for local development
Make sure you update your local branch to the latest.


####  Downloading the pretrained models
If you want to run the app locally for development purposes, download the pretrained models from [here](https://data.caltech.edu/records/dk5g7-rhq64/files/pretrained_models.zip?download=1), unzip them, and place them in a folder located at  
`/src/backend/sinr/pretrained_models`.  
If you only run the app in Docker, there's no need to download the models; Docker will handle this for you inside the image.

# Installing the app

1. We recommend using an isolated Python environment to avoid dependency issues. Install the Anaconda Python 3.9 distribution for your operating system from [here](https://www.anaconda.com/download). 

2. Create a new environment and activate it:
```bash
 conda create -y --name inatator python==3.9
 conda activate inatator
```

3. After activating the environment, install the required packages:
```bash
pip install -r src/backend/requirements.txt && pip install -r src/backend/requirements-dev.txt
```

4. install js libraries needed for react
```bash
npm i --prefix src/frontend/
```

# :penguin: Running the iNatAtor Application

## Run backend in first terminal:
1. Navigate to the main `ds4cg2024-inaturalist` directory if you are not already there:
2. Launch the **backend**:
```bash
 uvicorn src.backend.app.main:app --reload
```
## Run **frontend** in another terminal:
1. Navigate to the main `ds4cg2024-inaturalist` directory if you are not already there:
2. Launch the **frontend**:
```bash
  npm start --prefix src/frontend/
```

In your web browser, open the link [http://localhost:3000/](http://localhost:3000/)


# Running applications with Docker
1. Install Docker if you haven't already
2. Open Docker Desktop, you cannot run containers or build images, if docker engine is not running
2. Navigate project root
3. Run `docker compose up --build`, for the first build it may take a while, after build the application will be ran, you can access the application through the `localhost:3000`
5. You can stop contianers with ctrl+c or using the Docker app
6. If you want to start the application again, run `docker compose up`
7. If you want to just build images, run `docker compose build`
8. If you want to build and run containers, run `docker compose up --build`


# Code Standards
1. Use Docstrings, for some functions just a one-liner is fine, but for more complicated functions include multi-line documentation that explains the function simply, has information about arguments, and has details about the output.
2. Module Docstrings, include a short description of module and functions inside the module.
3. Use a formatter if possible. We have included [ruff](https://docs.astral.sh/ruff/) for linting and formatting in the developer dependencies in `requirements-dev.txt`.


##  🙏 Acknowledgements
This project was enabled by data from the Cornell Lab of Ornithology, The International Union for the Conservation of Nature, iNaturalist, NASA, USGS, JAXA, CIESIN, and UC Merced. We are especially indebted to the [iNaturalist](inaturalist.org) and [eBird](https://ebird.org) communities for their data collection efforts. We also thank Matt Stimas-Mackey and Sam Heinrich for their help with data curation. This project was funded by the [Climate Change AI Innovation Grants](https://www.climatechange.ai/blog/2022-04-13-innovation-grants) program, hosted by Climate Change AI with the support of the Quadrature Climate Foundation, Schmidt Futures, and the Canada Hub of Future Earth. This work was also supported by the Caltech Resnick Sustainability Institute and an NSF Graduate Research Fellowship (grant number DGE1745301).  

If you find our work useful in your research please consider citing our paper.  
```
@inproceedings{SINR_icml23,
  title     = {{Spatial Implicit Neural Representations for Global-Scale Species Mapping}},
  author    = {Cole, Elijah and Van Horn, Grant and Lange, Christian and Shepard, Alexander and Leary, Patrick and Perona, Pietro and Loarie, Scott and Mac Aodha, Oisin},
  booktitle = {ICML},
  year = {2023}
}
```

## 📜 Disclaimer
Extreme care should be taken before making any decisions based on the outputs of models presented here. Our goal in this work is to demonstrate the promise of large-scale representation learning for species range estimation, not to provide definitive range maps. Our models are trained on biased data and have not been calibrated or validated beyond the experiments illustrated in the paper. 
