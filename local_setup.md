# Local Setup

## Install Dependencies
```bash
npm install --legacy-peer-deps
```

## Run Postinstall (creates worklets symlink)
```bash
npm run postinstall
```

## Start on Android
```bash
npx expo start --android --clear
```

## Start on iOS
```bash
npx expo start --ios --clear
```

## Start on Web
```bash
npx expo start --web
```

## Notes
- Use `--legacy-peer-deps` for npm install due to dependency conflicts
- Postinstall script creates required symlink for react-native-worklets
- Add env variables to `.env` (see `.env.example`)
