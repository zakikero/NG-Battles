# Contributing Guide

This guide aims to establish clear rules for contributing to the project. By following these guidelines, we ensure effective collaboration and maintain code quality.

This document covers branch naming conventions, commit message rules (`fixed stuff` is unfortunately not a valid name), the Merge Request (MR) process, code review, and other essential best practices for navigating our project without losing your mind.

## 1. Branch Naming Convention

Branch naming convention is essential to maintain our project organized and understandable. We use a simplified approach adapted to our academic context, while drawing inspiration from industry practices.

### Main Structure

We maintain two main branches:

-   `master` or `main`: main branch containing stable code, ready for production/evaluation. Handle with care.
-   `dev`: development branch, integrates new features. This is where the magic happens (and sometimes everything explodes). Features should be stable, even if not completely finished.

### Working Branches

For any new development, create a branch from the appropriate branch following this convention:

`type/short-description`

Branch types:

-   `feature/`: for new features
-   `bugfix/`: for bug fixes
-   `hotfix/`: for urgent fixes (generally fewer changes than `bugfix/`)
-   `doc/`: for documentation updates (optional)

Examples:

-   `feature/user-authentication`
-   `bugfix/score-calculation-fix`
-   `hotfix/memory-leak-fix`
-   `doc/update-readme`

Rules:

1. Use a consistent separator between words (dash `-` or slash `/`). The important thing is to be uniform within the team.
2. Be concise but descriptive.
3. Use only lowercase letters and numbers.
4. Choose a language (French or English) for branch names and commit messages, and use it consistently.
5. Break down large features into several smaller, manageable branches.

### Branch Structure

-   `feature/` and `bugfix/` branches can start from `dev` or another `feature/` branch for sub-features.
-   `hotfix/` branches can start from `master` or `dev` depending on urgency.
-   `doc/` branches can start from `master` or `dev` depending on the stability level or progress of what is documented.
-   Avoid creating more than 2 or 3 levels of depth in the branch hierarchy.

### Breaking Down Large Features

It is strongly recommended to break down large features into several smaller branches. This facilitates code review, reduces potential conflicts, and allows for more frequent integration.

Example of breaking down a large "Recommendation System" feature:

-   `feature/recommendation-system` (main feature branch)
    -   `feature/recommendation-data-collection`
    -   `feature/recommendation-filtering-algorithm`
    -   `feature/recommendation-user-interface`

## 2. Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) convention to structure our commit messages. This approach makes the project history more readable and facilitates automatic changelog generation.

### Basic Format

```
<type>(optional scope): <description>
[optional body]
```

### Commit Types

-   `feat`: New feature
-   `fix`: Bug fix
-   `docs`: Documentation modification
-   `style`: Formatting changes (spaces, commas, etc.)
-   `refactor`: Code refactoring
-   `test`: Adding or modifying tests
-   `chore`: Maintenance tasks, dependency updates, etc.

### Examples

```
- feat(login): add login button on main page
- fix(login): hide login button if already connected
- docs(api): document authentication route API
- style(css): make site readable on mobile platform
- refactor(algorithm): replace giant ifs with optimized algorithm
- test(performance): verify app doesn't crash under heavy load
- chore(git): update project dependencies
```

### Best Practices

-   Use present imperative in the description ("add" instead of "added")
-   Separate subject from body with a blank line if you include a body
-   Use the body to explain the "what" and "why" of the change, not the "how"

For more details, see [conventionalcommits.org](https://www.conventionalcommits.org/).

## 3. Merge Request (MR) Process

Merge Requests (MR) are essential for integrating your work into a target branch (often `dev`). Follow these steps to create and manage your MRs effectively.

### Creating an MR

1. Ensure your branch is up to date with the latest version of the target branch.
2. Push your branch to the remote repository. **Tip**: If you use the terminal to push your branch, GitLab will automatically provide you with the URL to create a Merge Request.
3. In GitLab, create a new Merge Request from your branch to the target branch.

### MR Content

Your MR should include:

-   A clear and descriptive title, following the same convention as our commit messages (Conventional Commits).
-   A description detailing:
    -   The purpose of the MR
    -   Main changes (list of tasks accomplished or modifications made)
    -   Any potential impact on other parts of the project
-   (Optional) Appropriate labels (e.g., "feature", "bugfix", "documentation")
-   A person assigned to review your contribution (can be multiple people)

### Best Practices

-   Keep your MRs reasonably sized (ideally < 400 lines modified)
-   Resolve conflicts before requesting a review
-   Respond quickly to comments and suggestions
-   Update your MR if changes are requested
-   Avoid opening an MR too early in the development stage

### Approval Process

1. At least one other team member must approve the MR
2. All comments must be resolved before merging
3. CI tests must pass successfully
4. Once approved, you can proceed with the merge
5. (Optional) You can squash all commits into one and delete the source branch. Be careful with this combination as you risk losing your change history.

**Note**: Don't hesitate to ask for help if you encounter difficulties during this process.

## 4. Code Review and MR Approval

Code review is crucial for maintaining code quality and sharing knowledge within the team.

### Review Criteria

During review, check the following points:

-   Functionality: Does the code do what it's supposed to do?
-   Readability: Is the code easy to understand?
-   Style: Does the code follow our style conventions?
-   Tests: Are there appropriate tests for new features/fixes?

### Local Testing of Changes

**Important**: Don't just read the code. Always test changes locally:

1. Fetch the MR branch on your local machine.
2. Install necessary dependencies and compile the project if needed.
3. Manually test new or modified features.
4. Ensure that the modifications perform adequately and don't degrade user experience.
5. Verify that changes don't introduce regressions.

### Best Practices

-   Be respectful and constructive in your comments. Remember, behind every line of code is a team member.
-   Explain the "why" behind your suggestions.
-   Don't hesitate to ask for clarifications. "It's magic" is not sufficient documentation.
-   Praise good practices and innovative solutions.

## Conclusion

This contribution guide is designed to facilitate our collaboration and maintain the quality of our project. By following these guidelines, we create an effective, consistent, and less chaotic development environment.

Remember that these guidelines are here to help us, not to limit us. If you have suggestions for improving this guide, feel free to discuss them with the team.

Happy coding! 🚀
