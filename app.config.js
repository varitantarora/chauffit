const appJson = require('./app.json');

module.exports = ({ config }) => {
  const expoConfig = { ...appJson.expo, ...config };

  // Inject Google Maps API key from environment variable
  if (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) {
    expoConfig.android = {
      ...expoConfig.android,
      config: {
        ...expoConfig.android?.config,
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    };
  }

  return expoConfig;
};
