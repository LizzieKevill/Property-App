# UK Property App

A mobile-friendly web app for exploring UK house listings.

## Project status

Repository and hosting foundation. Listing sources, filters, and app features will be agreed next.

## Hosting

The `site/` folder contains the website. The GitHub Actions workflow publishes it to GitHub Pages when changes are pushed to `main`.

After publishing this repository to GitHub, open **Settings → Pages** and choose **GitHub Actions** as the source. The deployment workflow provides the live website URL.

GitHub Pages hosts the web interface. Any future listing integration that needs secret API keys or server-side processing will need a separate backend; secrets must never be included in website files.

## Progress

- [x] Local Git repository
- [x] Project README and progress checklist
- [x] Initial mobile-friendly holding page
- [x] GitHub Pages deployment workflow
- [ ] Publish repository to GitHub
- [ ] Enable GitHub Pages and verify the live URL
- [ ] Agree listing sources and app requirements
- [ ] Build the first property browsing experience

## Working locally

Open `site/index.html` in a browser to view the holding page. No dependencies or build tools are required yet.

Make focused commits describing each change. Update this checklist as milestones are completed.
