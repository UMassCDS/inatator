# Contribution Guidelines
These guidelines are designed to ensure consistency, quality, and ease of collaboration within the DS4CG-iNaturalist team. Adhering to these standards helps maintain a clean and efficient codebase, making it easier for team members to review, understand, and contribute to the project.

## Code Review Process
1. **Reviewers Requirement**
    - Each piece of code must be reviewed and approved by at least two members of the DS4CG-iNaturalist team. This ensures that multiple perspectives are considered, increasing code quality and reducing the likelihood of errors.
2. **Pull Request (PR) Guidelines**
    - **Size**: Keep pull requests and changes as small as possible. Smaller PRs are easier to review and test, making the review process more efficient.
    - **Descriptions**: Every pull request must include a clear and detailed description with the following elements.
        - **Features**: A bullet list of features or changes contributed in the PR.
        - **Goal**: A brief explanation of the objective or problem the PR aims to address.
        - **Link to Issues or Work Item**:  A reference to the relevant task or work item, providing context for the changes and helping track progress.
3. **Update the ChangeLog**
    - **ChangeLog File**: should happen on every PR!
        - Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
        - Version Number (if updated).
        - Comment Sections: features, fixes, changes that went into the code. If the code version is not updated, add features/bugs in the “Unreleased” comment section. 

## Automated Deployment Pipeline
The DS4CG-iNaturalist project utilizes an automated pipeline to build docker images and deploy them to our DockerHub in an effort to maintain versions of our code. The deployment process involves building and pushing Docker images. These images are triggered by tagging a new code version. The process automatically builds the frontend and backend components, creating separate Docker images for each.

## Release Process
Preparing a release involves making sure all features for the release are in the main branch, updating the version numbers in all code and documentation, then creating a release on GitHub and corresponding tag. The general steps are: 
1. Ensure all features and bug fixes to be included in the release are merged into the main branch.
2. Decide on the new version number following the [Semantic Versioning](https://semver.org/) guidelines. For example, `vX.Y.Z`.
3. Create a Release Branch:
    - Create a release branch named `release-vX.Y.Z` from `main`.

4. Tag the Release:
    - Update all version numbers and documentation in the code on the release branch:
    - Ensure all documentation is up-to-date, including the changelog and README if necessary and commit updates to the branch.
    - Update the `image` tags with the proper version number (vX.X.X) in the docker-compose.yml file. 
    - Update Changelog:
      1. Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
      1. Add a new version header with the release date.
    - Push the release branch to the remote repository.
5. Use the [Github managing release instructions](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) to make a formal release on Github:
     1. On GitHub.com, navigate to the main page of the repository.
     1. To the right of the list of files, click **Releases**.
     1. At the top of the page, click **Draft a new release**.
     1. To choose a tag for the release, select the **Choose a tag** dropdown menu.
     1. Type a version number for your release, then click **Create new tag**.
     1. Select the **Target** dropdown menu, then click the branch that contains the project you want to release.
     1. In the **"Release title"** field, type a title for your release.
     1. In the **"Describe this release"** field, type a description for your release.
            - good idea to use in release description updates added to CHANGELOG file for this release.
     1. If you're ready to publicize your release, click **Publish release**.
6. Merge Back: Merge the release branch back into `main`.

## Coding Conventions 

### Semantic Versioning 
[Semantic Versioning](https://semver.org/), often abbreviated as SemVer, is a versioning system used for software development. It provides a standardized way to manage and communicate changes in software releases, helping developers, users, and automated systems understand the nature of changes and their potential impact. 

### Version Number Format
Semantic Versioning uses a three-part version number format: **vMAJOR.MINOR.PATCH**, where:
- **MAJOR**: Increases when there are incompatible API changes.
- **MINOR**: Increases when functionality is added in a backward-compatible manner.
- **PATCH**: Increases when backward-compatible bug fixes are made.

### Commit Naming Conventions
- Use clear and descriptive commit messages.
- Start with a verb in the present tense (e.g., "Add", "Fix", "Update").
- Start with a capital letter and end with a period. 
- Example: `Add user authentication feature`.

### Code Standards
- **Docstrings**:
    - Use docstrings for all functions. For simple functions, a one-liner is fine. For more complex functions, include multi-line documentation that explains the function, provides information about arguments, and details the output.
    - Include module docstrings with a short description of the module and its functions.
- **Formatting**:
    - Use a formatter to ensure code consistency. We have included `ruff` for linting and formatting in the developer dependencies in `requirements-dev.txt`.
