# Contribution Guidelines

## Pull Request Rules
- Needs at least two reviewers from the team to approve for code to be considered ready for merging.
- Keep pull requests and changes as small as possible to facilitate easier reviews and minimize merge conflicts.

### Pull Request Descriptions
- **Features**: Include a bullet list of features that were contributed.
- **Goal**: Clearly state what you are trying to accomplish with this PR.
- **How to Test**: Provide detailed instructions on what a reviewer can expect to work when testing this.
- **Link to Issues**: Reference any related issues by linking to them.

## Release Process
1. **Prepare the Release**:
    - Ensure all features and bug fixes for the release are merged into the `main` branch.
    - Update the version number in relevant files (e.g., `docker-compose.yml`) following [Semantic Versioning](https://semver.org/).

2. **Update Changelog**:
    - Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
    - Add a new version header with the release date.
    - List all new features, bug fixes, and improvements.

3. **Create a Release Branch**:
    - Create a release branch named `release-vX.Y.Z` from `main`.
    - Ensure all documentation is up-to-date, including the changelog and README if necessary.
    - Push the release branch to the remote repository.

4. **Tag the Release**:
    - Once the release branch is tested and ready, create a tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
    - Push the tag to the remote repository: `git push origin vX.Y.Z`.

5. **Merge Back**:
    - Merge the release branch back into `main`.
    - Delete the release branch.

## Changelog
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/).

## Commit Naming Conventions
- Use clear and descriptive commit messages.
- Start with a verb in the present tense (e.g., "Add", "Fix", "Update").
- Start with a capital letter and end with a period. 
- Example: `Add user authentication feature.`.

## Code Standards
- **Docstrings**:
    - Use docstrings for all functions. For simple functions, a one-liner is fine. For more complex functions, include multi-line documentation that explains the function, provides information about arguments, and details the output.
    - Include module docstrings with a short description of the module and its functions.
- **Formatting**:
    - Use a formatter to ensure code consistency. We have included `ruff` for linting and formatting in the developer dependencies in `requirements-dev.txt`.
