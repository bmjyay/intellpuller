/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint isn't in devDependencies for this project -- skip next's
  // build-time lint step rather than pull in the config interactively.
  eslint: { ignoreDuringBuilds: true },
  // Turn off the "N" dev-tools badge that floats in a corner during
  // `npm run dev`. It never shows in a production build/start, but it's
  // one more thing to explain away when someone's just looking at the app.
  devIndicators: false,
};

export default nextConfig;
