# Claude Instructions for austin-city-tours

## Git Workflow

- **Never commit directly to `main`**. All changes must be made on a feature branch.
- Branch naming: `type/short-description` — e.g. `fix/booking-validation`, `feat/new-tour`, `chore/update-deps`
- When starting any task that involves code changes, create a branch first:
  ```bash
  git checkout -b type/description
  ```
- When done, push the branch and open a PR against `main`:
  ```bash
  git push origin type/description
  gh pr create --base main
  ```
- Do not push to `main` directly, even after a rebase.
