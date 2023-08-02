# Serverless IIIF Documentation

This documentation uses [Nextra](https://nextra.site/). The documentation app is a [NextJS](https://nextjs.org/) app which lives in the `/docs` directory and is isolated from the rest of the root `serverless-iiif` project files.

## Updating documentation

Navigate to the `/docs` directory, and run

```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

## Generate static site docs

Run `npm run build`, which will output the static site in `/docs/out`.
