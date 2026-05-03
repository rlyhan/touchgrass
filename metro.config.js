const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { withStorybook } = require("@storybook/react-native/metro/withStorybook");

const config = getDefaultConfig(__dirname);

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK === "true";

const configWithStorybook = withStorybook(config, {
  enabled: storybookEnabled,
  configPath: path.resolve(__dirname, "./.storybook"),
});

module.exports = withNativeWind(configWithStorybook, { input: "./global.css" });
