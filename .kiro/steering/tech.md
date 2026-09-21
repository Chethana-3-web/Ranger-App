# Ranger App – Technical Steering

## Stack
- **React Native** with **Expo SDK 57** (managed workflow)
- **JavaScript only** – no TypeScript. Document public APIs with JSDoc.
- **React Navigation v7** – native stack + bottom tabs (same pattern as BinGo)
- **AsyncStorage** – local offline storage
- **NetInfo** – connectivity monitoring
- **expo-crypto** – UUID generation
- **expo-location** – GPS coordinates
- **expo-image-picker** – camera / gallery

## Code Rules
- No login flow – use seeded `SessionContext` (Ranger Perera, PARK-YALA, PTL-001)
- No real backend – server is mocked in `syncService.js`
- Small pure functions, dependency injection, no global mutable state
- Follow BinGo mobile app conventions: same folder layout, same JSDoc style,
  same colour system approach (green palette adapted for wildlife)

## Testing
- Jest with `jest-expo` preset
- `@testing-library/react-native` for component tests
- Test naming: `<method>_<condition>_<expectedResult>`
- Pattern: Arrange – Act – Assert
- Tests must never touch real devices, network, or file system

## Lint / Format
- ESLint with `eslint-config-expo`
- Prettier – single quotes, trailing commas, 100 char width
- Run: `npm run lint` / `npm run test`

## Git Workflow
- `main` – stable scaffold
- `dev` – common foundation
- `feature/<name>` – individual features
- Conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:`
- Never force-push; never merge unless instructed
