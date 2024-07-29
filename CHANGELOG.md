# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2024-07-29
### Added
- Added loading bar to the application
- Added error handling for invalid taxa names, that caused the server to crash
- Added DB functionality for postgres, and any other compatible DB, using sqlalchemy
- Added postgres docker image that builds with docker compose along with other services

### Updated
- Persistent storage with DBs
- Save and clear buttons now operate on the database rather than files in directory
- Updated README with new instructions and guides on how to work with database for development

## [0.1.0] - 2024-07-18
### Added
- CHANGELOG
