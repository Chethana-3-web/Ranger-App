# Ranger App – Git Workflow

## Branch Strategy
| Branch                      | Purpose                                              |
|-----------------------------|------------------------------------------------------|
| `main`                      | Stable scaffold – initial Expo + deps setup          |
| `dev`                       | Common foundation (session, services, nav, UI kit)   |
| `feature/log-patrol-incident` | Log Incident screen (your feature branch)          |
| `feature/<teammate-feature>`  | Each teammate's feature branch (from `dev`)         |

## Conventional Commits
Format: `<type>(<scope>): <short summary>`

| Type     | When to use                              |
|----------|------------------------------------------|
| `feat`   | New feature or screen                    |
| `fix`    | Bug fix                                  |
| `chore`  | Tooling, deps, config (no code change)   |
| `test`   | Adding or fixing tests                   |
| `docs`   | README, comments, steering files         |
| `style`  | Formatting only (no logic change)        |
| `refactor` | Code restructure without behaviour change |

Examples:
```
chore: initial Expo JavaScript scaffold with Jest and ESLint
feat(session): add seeded SessionContext and useSession hook
feat(storage): add AsyncStorage wrappers in storageService
feat(incidents): add logIncident and getIncidentsByPatrol
feat(log-incident-screen): implement LogIncidentScreen with GPS and photo
test(incidentService): add unit tests for logIncident and markSynced
```

## Rules
- Always create a new branch from `dev` for features (`git switch -c feature/<name> dev`)
- Never force-push (`git push --force`)
- Never merge branches unless explicitly told to
- Keep commits small and focused – one logical change per commit
- Push with `-u` to set remote tracking: `git push -u origin <branch>`
