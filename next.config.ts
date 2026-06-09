import type { NextConfig } from 'next';

// When building for GitHub Pages we produce a fully static export. The site is
// served from https://<user>.github.io/<repo>/, so we need a base path that
// matches the repository name. On Vercel (or local dev) none of this applies
// and the app runs as a normal server-rendered Next.js application.
const isGithubPages = process.env.GITHUB_PAGES === 'true';

// Derive the repo name from GITHUB_REPOSITORY ("owner/repo") in CI, with an
// optional manual override via BASE_PATH for local static builds.
const repoName =
  process.env.BASE_PATH ??
  (process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`
    : '');

const nextConfig: NextConfig = isGithubPages
  ? {
      output: 'export',
      basePath: repoName,
      assetPrefix: repoName || undefined,
      images: { unoptimized: true },
      // Static hosts can't redirect /path -> /path/, so emit folder index files.
      trailingSlash: true
    }
  : {};

export default nextConfig;
