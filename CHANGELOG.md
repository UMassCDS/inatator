# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- styles/ directory: Broke up the App.css file into smaller components
- Responsive styles that dynamically render based on screen size
- Reformatted autocomplete results
- Trimmed down autocomplete results to display top 15 results, instead of hundreds
- Hover effects over buttons for more responsiveness
- mantine component library components
- frontend is switched to vite+react, recommended by mantine library
- Application now uses Vite build tool
- Added new visuals for loading status
- Ability to cycle through species images
- Wikipedia page link for species
- Total number of observation for species
- Short wiki summary for species
- Added tooltip for help and cycle image buttons
- Added a button to sample data-points from the annotation on-screen. Sampling is handled in backend with a uniform sampling in a circle that encapsulates the hexagon. Downloaded csv is directly compatible with fine-tuning suite on SINR.
- Docs folder with poster pdf

### Updated
- package-lock.json: Lock file was updated when ran with `npm i`, removal of testing libraries for react suggest a change in react's dependencies.
- README updated to reflect new application url and instruction on running Vite
- Converted old JS components into JSX components and updated components with mantine counterparts
- frontend dockerfile to build vite before serving
- Broke up functions in App.js into separate functions in utils.js, makes it more readable
- Fixed hexagon rendering at the dateline, longitude = +-180

### Removed
- old css files that are now unused
- loadingbarstatus.js, now we use loading overlays and display errors with alerts
- Removed prediction polygon layer, was unused

## [1.0.0] - 2024-08-12
### Added
- Instruction Component: Added a new component with instructions for using the app, accessible via an expandable/collapsible button.
- Load Annotation Functionality: Introduced the ability to load the last saved annotation for the currently selected taxon.
- Added loading bar to the application
- Added error handling for invalid taxa names, that caused the server to crash
- Added DB functionality for postgres, and any other compatible DB, using sqlalchemy
- Added postgres docker image that builds with docker compose along with other services
- Functionality to use the state of the toggle switch.
- Toggle slider for presence/absence data.
- A selection/drawing tool is available on the map, allowing users to draw either a rectangle or a polygon.
  - A toggle allows users to switch between the types of hexagons (presence or absence).
  - Users can:
    - Draw a polygon to add annotation hexagons to the map.
    - Draw a rectangle to remove annotation hexagons from the map.
- Functionality to save presence/absence annotation data to the database.
- Incorporated prediction database framework, tables with hexagons indexes and scores. 
- `generate_prediction` now retrieves predictions from database, or generates them and stores them if not in database.
- Functionality to change threshold in the UI
- Added iNaturalist Observations layer to the map component, which takes user observations from the iNaturalist tiles server in the same format as it is shown on the iNaturalist website.
- docker file to set up the github actions and create a frontend and backend image to push to docker hub.


### Updated
- `Clear Annotation` Functionality: The "Clear Annotation" button now clears the current annotation from the map, allowing users to start fresh without saving changes to the database.
- `Generate Prediction` Logic: Always sets "Prediction Hexagon IDs" as the starting point for annotations.
- Default Map Layer Settings: The "Prediction Hexagons" map layer is now unchecked by default.
- Sidebar Component: Made the Model field read-only for better clarity.
- Persistent storage with DBs
- Save and clear buttons now operate on the database rather than files in directory
- Updated README with new instructions and guides on how to work with database for development
- `save_annotation` method to save annotation with type.
- `load_annotation` method to load the latest annotation for the given `taxa_name` and `taxa_id`.
- Updated colors in the app to be accessible to colorblind people using the [Bang Wong](https://www.nature.com/articles/nmeth.1618) palette.
- Update the file that stores taxa_names to use the common names in the drop-down menu.
- Update the title and description in index.html.

### Fixed
- The `Taxa Name` info box now correctly clears when an invalid taxa ID is entered.
- After changing the Taxa in the drop-down menu, the layers with predictions and annotations on the map are now cleared.

## [0.1.0] - 2024-07-18
### Added
- CHANGELOG
