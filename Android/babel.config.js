// babel.config.js
module.exports = function (api) {
    api.cache(true); // Cache the configuration for better performance
    return {
      presets: ['babel-preset-expo'], // Use the Expo preset
      plugins: [
        'nativewind/babel', // Add the nativewind plugin
      ],
    };
  };