/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint isn't in devDependencies for this project -- skip next's
  // build-time lint step rather than pull in the config interactively.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
