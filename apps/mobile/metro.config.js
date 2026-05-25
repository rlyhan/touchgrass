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

// Workspace TS packages (e.g. @touchgrass/types) use NodeNext-style explicit
// .js extensions on relative imports for the core API runtime. Metro doesn't
// rewrite those to .ts the way tsx does, so strip the .js and retry.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith(".") && moduleName.endsWith(".js")) {
    try {
      return context.resolveRequest(context, moduleName.slice(0, -3), platform);
    } catch {
      // Fall through to the default resolver below.
    }
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK === "true";

const configWithStorybook = withStorybook(config, {
  enabled: storybookEnabled,
  configPath: path.resolve(projectRoot, "./.storybook"),
});

module.exports = withNativeWind(configWithStorybook, { input: "./global.css" });
