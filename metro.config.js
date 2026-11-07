const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// expo-sqlite on the web loads a WebAssembly file.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// NativeWind compiles global.css (Tailwind) for React Native Reusables components.
// inlineRem: 16 is the rem size Reusables expects.
const nativeWindConfig = withNativeWind(config, { input: './global.css', inlineRem: 16 });

// expo-sqlite on the web needs SharedArrayBuffer, which browsers only allow with these headers.
// Added after withNativeWind so its own middleware is kept.
const enhanceMiddleware = nativeWindConfig.server.enhanceMiddleware;
nativeWindConfig.server.enhanceMiddleware = (middleware, metroServer) => {
  const enhancedMiddleware = enhanceMiddleware ? enhanceMiddleware(middleware, metroServer) : middleware;

  return (request, response, next) => {
    response.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return enhancedMiddleware(request, response, next);
  };
};

module.exports = nativeWindConfig;
