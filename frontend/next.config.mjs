/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack(config, { isServer }) {
		if (isServer) {
			config.resolve = config.resolve || {};
			config.resolve.alias = config.resolve.alias || {};
			// Prevent the server build from attempting to require the native 'canvas' package
			// which Konva's node entry references. We only need Konva on the client.
			config.resolve.alias.canvas = false;
		}
		return config;
	},
};

export default nextConfig;
