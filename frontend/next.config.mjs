/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack: (config) => {
        // Ignore optional Node-only deps from walletconnect/pino in the browser
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias["pino-pretty"] = false;
        config.resolve.alias["lokijs"] = false;
        config.resolve.alias["encoding"] = false;
        // Work around browser bundling issues from transitive deps
        config.resolve.alias["rpc-websockets/dist/lib/client"] = false;
        config.resolve.alias["rpc-websockets/dist/lib/client/websocket"] = false;
        return config;
    },
};

export default nextConfig;
