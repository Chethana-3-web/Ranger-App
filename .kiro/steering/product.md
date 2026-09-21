# Ranger App – Product Steering

## Purpose
Smart Wildlife Conservation and Anti-Poaching Monitoring System for the
Sri Lanka Department of Wildlife Conservation (SE3070 Assignment 02).

Provides field rangers with a mobile tool to:
- Log patrol incidents (snares, carcasses, illegal camps, at-risk species footprints)
- Work fully offline in low/no connectivity terrain
- Automatically sync data when connectivity is restored
- Receive collar alerts and camera-trap notifications

## Actors
| Actor              | Role                                                        |
|--------------------|-------------------------------------------------------------|
| Ranger             | Logs incidents on patrol, primary mobile app user           |
| Park Manager       | Views dashboard, assigns patrols (out of scope for app)     |
| Conservation Researcher | Analyses data reports (out of scope for app)           |
| Community Liaison  | Responds to human-wildlife conflict alerts (future feature) |

## Parks Supported
- Yala National Park (PARK-YALA) – open grassland
- Sinharaja Forest Reserve (PARK-SINHARAJA) – dense jungle
- Udawalawe National Park (PARK-UDAWALAWE) – elephant country

## In Scope (This Assignment)
- Common foundation (navigation, session, storage, sync, UI kit)
- Log Patrol Incident feature

## Out of Scope (Teammate Features)
- Camera-trap image review (`src/features/camera-trap/`)
- GPS collar alert management (`src/features/collar-alerts/`)
- Community conflict reporting (`src/features/community-reports/`)
- Park Manager dashboard (separate web app)
