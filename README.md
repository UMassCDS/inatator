
# iNaturalist Geomodel Annotation Tool 

Our iNatator tool is a web application for experts to annotate species range maps based on predictions from the [Spatial Implicit Neural Representations (SINR)/iNaturalist Geomodel](https://github.com/elijahcole/sinr).
This project started as part of the Data Science for the Common Good program run by the Center for Data Science at UMass Amherst. You can view [a demo video of the tool on Youtube](https://youtu.be/5KFIZr_pxLc?si=n2TNjMmTRC0qKoix) or see an overview of the approach in [our poster](docs/inaturalist_poster.pdf).

Collaborators: Angela Zhu, Paula Navarrete, Sergei Pogorelov, Ozel Yilmazel 

## 🌍 Overview 
The iNaturalist team is interested in improving the predictions outputted by the Geomodel by asking experts that understand species ranges to share their knowledge and incorporate it into the Geomodel. To this end, we created a tool that allows obtaining expert feedback through annotations of species ranges in an interactive map.

You can use this code to, for a species of your choosing, show current Geomodel predictions from SINR models onto the map, annotate the species range map considering presence and absence data, save the annotation to the database, and retrieve previous annotations from the database.

 Original SINR Information: Spatial Implicit Neural Representations for Global-Scale Species Mapping - ICML 2023 ICML 2023 paper [Spatial Implicit Neural Representations for Global-Scale Species Mapping](https://arxiv.org/abs/2306.02564). 


# Getting Started

## :hatched_chick: Installation for local development
1. Clone the repository `git clone git@github.com:UMassCDS/inatator.git`

2. For local development and testing, you can choose a database engine from two options, PostgreSQL or SQLite. The most important thing is to ensure the `DATABASE_URL` is configured appropriately for your database according to [SQLAlchemy Database Engine docs](https://docs.sqlalchemy.org/en/20/core/engines.html#database-urls). To aid in setting up the database we've provided example environment files, .env.copy and .docker.env.copy, where the environment variables are listed. You can copy them to .env or .docker.env and fill in the values. 

    a. _PostgreSQL_: Run Postgres in a [local Postgres server](https://www.postgresql.org/docs/current/server-start.html) or Docker container (see provided docker-compose.yml). You should configure the following  environment variables in your environment file (.env or .docker.env).
    - `POSTGRES_DB`: Name of your database
    - `POSTGRES_USER`: Username the server will use to connect to the database
    - `POSTGRES_PASSWORD`: Password the server will use to connect to the database
    - `DATABASE_URL`: SQLAlchemy database connection URL. This should be something like `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:PORT_NUMBER/${POSTGRES_DB}`, but 
    
    b. _SQLite_: Storing the databases in a simple SQLite database file is useful for development and testing, but shouldn't be used in production. You only need to configure the `DATABASE_URL=sqlite://<path to desired database file>`

3. Navigate to cloned project's root, run `git submodule init` and then `git submodule update --remote --merge`

4. You are all set for setting up the code.

Note: We need .env for local development, and .docker.env for docker containers. The difference between them is database url, which is caused by how docker manages networks.

Note: to update submodules with latest changes, run `git submodule update --remote --merge`

Note: `src/backend/sinr` is a submodule from `UMassCDS/inatrualist-sinr`, if you need to work on `sinr` code, follow development practices for that repository, this includes making a dedicated development branch, making PRs.

Note: If you need to switch to a particular `UMassCDS/inaturalist-sinr` branch and run the prototype, navigate to `src/backend/sinr`, use `git checkout <branch-name>` to switch to a branch. Now the submodule will be at a different branch.

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

Note: If you get errors for psycopg2-binary, installing PostgreSQL can solve it. See [PostgreSQL documentation](https://www.postgresql.org/download/) for installation instructions and repeat step 3 after installing.

4. install js libraries needed for react
```bash
npm i --prefix src/frontend/
```

# :penguin: Running the iNatAtor Application

## Run Application Locally

### Terminal 1: Run the Database
1. Open a terminal and navigate to the main `ds4cg2024-inaturalist` directory
2. Launch **postgres container**:
```bash
docker compose up --build db
```

### Terminal 2: Run the Backend
1. Launch another terminal window and navigate to project root.
2. Activate environment:
```bash
  conda activate inatator
```
3. Launch the **backend**:
```bash
  uvicorn src.backend.app.main:app --reload --env-file .env
```
### Terminal 3: Run the Frontend
1. Launch another terminal window and navigate to project root.
2. Launch the **frontend**:
```bash
  npm run dev --prefix src/frontend/
```

In your web browser, open the link [http://localhost:5173/](http://localhost:5173/)


## Run Application Locally with Docker Desktop
1. Install Docker if you haven't already. Open Docker Desktop, you cannot run containers or build images, if docker engine is not running
2. Now in terminal, navigate to project root. Ensure you have a local version of the `.docker.env` file with secrets. 
3. Build and Compose Docker Images: \
  Build docker images: For the first build it may take a while.
  ```bash
    docker compose build
  ```
  To run the application:
  ```bash
    docker compose --env-file ./.docker.env up
  ```
4. You can access the application through the [http://localhost](http://localhost) on your browser. You can stop containers with ctrl+c or using the Docker app.

Additional Docker commands:
- Start the application again, run `docker compose up`
- Just build images, run `docker compose build`
- Build and run containers, run `docker compose up --build`
- Build only one service, run `docker compose build <service-name>`, for example `docker compose build backend`

Note: you don't have to initialize submodule to run docker, dockerfile will set up the submodules for you while building the image.


## Working with the Database

Sometimes you want to run the application without containers, allowing you to develop things quickly. The **Running the iNatAtor Application** section explains how to run the application locally.

You can verify connections are working by going to `localhost:8000/health`.

Note: The codebase is getting bigger, therefore add database related code in `src/backend/app/db`, then make proper API routes in main, if it gets too big, we can resort to using API routers from fastapi.

Note: There are two environment files (.env and .docker.env) because the database url for local development and docker environments are separate.

Make sure you always update your local branch to the latest.

##  🙏 Acknowledgements
This project was enabled by data from the Cornell Lab of Ornithology, The International Union for the Conservation of Nature, iNaturalist, NASA, USGS, JAXA, CIESIN, and UC Merced. We are especially indebted to the [iNaturalist](inaturalist.org) and [eBird](https://ebird.org) communities for their data collection efforts. We also thank Grant Van Horn, Max Hamilton, Elijah Cole, Oisin Mac Aodha, Alex Shepard, Subhransu Maji, Sam Heinrich and Sarah Akbar for their suggestions and contributions to the design and testing process. 

If you find our work useful in your research please consider citing the SINR Geomodel paper.  
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
