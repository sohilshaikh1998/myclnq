module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
  dependencies: {
    'react-native-bluetooth-classic': {
      platforms: {
        android: null, // Disable auto-linking for Android
      },
    },
  },
};
