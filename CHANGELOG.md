# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

You should also add project tags for each release in Github, see [Managing releases in a repository](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).

## [Unreleased]
### Added
- Added example auto-built Sphinx documentation in the `docs` folder
- Github workflow for running ruff linter
### Changed
- All build and packaging switched to use only pyproject.toml
- Minimum python version changed to 3.10
### Removed
- Removed setup.cfg

## [1.0.0] - 2022-05-23
### Added
- README and CHANGELOG
- cdstemplate packages for computing word count from input text
- corpus_counter_script.py as a user-facing script with argparse examples
- Tests of cdstemplate packages
- A github workflow to trigger tests on pull request to the main branch
- Sample text data from Project Gutenberg
- Data Version Control stage for the corpus_counter_script.py
- A sample Jupyter notebook that plots most frequent words the Gutenberg data
