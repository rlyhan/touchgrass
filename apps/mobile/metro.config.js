const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { withStorybook } = require("@storybook/react-native/metro/withStorybook");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK === "true";

const configWithStorybook = withStorybook(config, {
  enabled: storybookEnabled,
  configPath: path.resolve(projectRoot, "./.storybook"),
});

module.exports = withNativeWind(configWithStorybook, { input: "./global.css" });
