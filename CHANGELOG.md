# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] 
### Added
- Instruction Component: Added a new component with instructions for using the app, accessible via an expandable/collapsible button.
- Load Annotation Functionality: Introduced the ability to load the last saved annotation for the currently selected taxon.
- Added loading bar to the application
- Added error handling for invalid taxa names, that caused the server to crash
- Added DB functionality for postgres, and any other compatible DB, using sqlalchemy
- Added postgres docker image that builds with docker compose along with other services
- docker file to set up the github actions and create a frontend and backend image to push to docker hub.

### Updated
- `Clear Annotation` Functionality: The "Clear Annotation" button now clears the current annotation from the map, allowing users to start fresh without saving changes to the database.
- `Generate Prediction` Logic: Always sets "Prediction Hexagon IDs" as the starting point for annotations.
- Default Map Layer Settings: The "Prediction Hexagons" map layer is now unchecked by default.
- Sidebar Component: Made the Model field read-only for better clarity.
- Persistent storage with DBs
- Save and clear buttons now operate on the database rather than files in directory
- Updated README with new instructions and guides on how to work with database for development

## [0.1.0] - 2024-07-18
### Added
- CHANGELOG
