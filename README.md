# Mindrivo public level content

This repository contains public, static game content consumed by the Mindrivo app. It must contain only public level JSON and manifest files. Never add player data, account information, credentials, tokens, or app source code.

## Current content

- `manifest.json`: index of remote levels.
- `levels/11.json` and `levels/12.json`: initial sample levels.

The current repository contains only levels 11 and 12; it is not a complete 100,000-level library. Add new levels to `levels/` and update the manifest when content is authored and validated.

## Deployment

GitHub Actions publishes this repository to GitHub Pages when changes are pushed to `main`. In repository Settings → Pages, choose **GitHub Actions** as the build and deployment source. The expected manifest URL is `https://pradeepkumarcsealpha2-spec.github.io/mindrivo-levels/manifest.json` after the first successful deployment.
