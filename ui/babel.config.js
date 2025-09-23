module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            'react-native-maps': '@expo/vector-icons',
            'react-native-webview': '@expo/vector-icons',
          },
          platforms: ['web'],
        },
      ],
    ],
  };
};