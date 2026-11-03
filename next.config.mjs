const nextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    images: {
        // Sem `search`: as URLs do Unsplash usam query string (?auto=format&w=…)
        remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
        qualities: [75, 85],
    },
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};
export default nextConfig;
