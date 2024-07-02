# iNaturalist GeoModel Annotator Project

Code repository for 2024 Data Science for the Common Good project with iNaturalist. 

Collaborators: Angela Zhu, Paula Navarrete, Sergei Pogorelov, Ozel Yilmazel 

This template draws a lot of inspiration from [Cookiecutter Data Science](https://drivendata.github.io/cookiecutter-data-science/). Please read their awesome explanations!

# Getting Started
## :hatched_chick: Installation for local development
Please read instructions carefully and don't skip ahead.

### React Components
1. Navigate to `src/frontend`
2. Run `npm i` that will install js libraries needed for react.

### Backend and SINR Dependency Installation
1. Make sure you update your local branch to the latest.

2. Create and activate your environment, rename the environment if you already have an existing one and would like to preserve it. If you want a fresh start, `conda deactivate` then `conda remove -n inatator`. Then run:
```
conda create -n inatator python=3.10
conda activate inatator
```

3. At the root of the project `pip install -r src/backend/requirements.txt` and `pip install -r src/backend/requirements-dev.txt`.

## :penguin: Run the Application
Open two terminals. You will need to run the server first, then application frontend.
1. ***Run the backend (server):*** To start the server, navigate to project root, run `uvicorn src.backend.app.main:app --reload`, to make sure it is working go to `http://localhost:8000/hello/` in your browser.
2. ***Run the frontend (application):*** To start the application, navigate to `src/frontend/` you see there are js things, you are at the right spot. Now run `npm start`, it will start running the app and should automatically open to page in your browser.

### Running applications with Docker
1. Install Docker if you haven't already
2. Navigate project root
3. Run `docker-compose up --build`, for the first build it may take a while
4. Make sure the default application is running as expected by going to urls for react and server
5. During development, you can stop contianers with ctrl+c or using the Docker app
6. If you want to start the application again, run `docker compose up`
7. If you change a docker configuration file, run `docker compose up --build`

## Code Standards
1. Use Docstrings, for some functions just a one-linet is fine, but for more complicated functions include multi-line documentation that explains the function simply, has information about arguments, and has details about the output.
2. Module Docstrings, include a short description of module and functions inside the module.
3. Use a formatter if possible, **black** formatter has support for vscode and is decent
