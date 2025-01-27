const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const customConfig = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

// Merge and wrap with reanimated metro config
const mergedConfig = mergeConfig(defaultConfig, customConfig);
module.exports = wrapWithReanimatedMetroConfig(mergedConfig);
