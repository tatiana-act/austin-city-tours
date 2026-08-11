# Claude Instructions for austin-city-tours

## Git Workflow

Work is staged on `dev` and released to `main` in batches. Merging into `main`
triggers a production deployment, so `main` is the owner's release switch — never
the agent's.

- **Never commit directly to `main` or to `dev`.** All changes go on a feature branch.
- **Base feature branches on `dev`, and open PRs against `dev`:**
  ```bash
  git checkout dev && git pull
  git checkout -b type/description
  git push origin type/description
  gh pr create --base dev
  ```
- Branch naming: `type/short-description` — e.g. `fix/booking-validation`,
  `feat/new-tour`, `chore/update-deps`
- **Only the owner merges `dev` into `main`**, when they choose to release. Do not
  open or merge that PR without being asked.
- Do not push to `main` directly, even after a rebase.
- This rule is for the agent. The owner commits content changes (schedule, tours)
  straight to `main` on purpose — those have no reviewer, so a PR would be ceremony.

### Keeping `dev` in sync

Dependabot targets the default branch, so its PRs land on `main` and `dev` falls
behind. After any merge into `main` that did not come from `dev`, merge `main` into
`dev` before starting new work:

```bash
git checkout dev && git pull && git merge origin/main && git push
```

### Deployments

Every pushed branch gets its own Vercel **preview** deployment — that is what the
owner opens on a phone, so state the preview URL in the PR and say whether a mobile
look is needed (it is, if the PR changes markup, text or behaviour; it is not, for
types, configs, metadata or dead-code removal). Only `main` deploys to
**production**.
