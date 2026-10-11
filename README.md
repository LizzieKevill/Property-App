# UK Property App

A mobile-friendly web app for exploring UK house listings.

## Project status

Repository and hosting foundation. Requested features and open decisions are recorded in [REQUIREMENTS.md](REQUIREMENTS.md).

## Hosting

The `site/` folder contains the website. The GitHub Actions workflow publishes it to GitHub Pages when changes are pushed to `main`.

After publishing this repository to GitHub, open **Settings → Pages** and choose **GitHub Actions** as the source. The deployment workflow provides the live website URL.

GitHub Pages hosts the web interface. Any future listing integration that needs secret API keys or server-side processing will need a separate backend; secrets must never be included in website files.

## Progress

- [x] Local Git repository
- [x] Project README and progress checklist
- [x] Initial mobile-friendly holding page
- [x] GitHub Pages deployment workflow
- [x] Publish repository to GitHub
- [x] Enable GitHub Pages and verify the live URL
- [ ] Agree listing sources and app requirements
- [x] Build the first property browsing experience with labelled sample data
- [ ] Connect authorised live listing data

## Working locally

Serve the app with `node preview.mjs`, then open `http://127.0.0.1:4173`. It uses JavaScript modules, so opening the HTML directly from the filesystem is not supported. No dependencies or build tools are required.

Run `node tests/model.test.mjs`, `node tests/app.test.mjs`, and `node tests/discovery.test.mjs` for the filter, interaction, discovery and merge checks. See [AUTOMATION.md](AUTOMATION.md) for API setup and scheduled searches.

## First version

Field & Home includes editable saved filters, seen/decision tracking, custom folders, favourites, manual listing entry, original-link sharing, notes, price observations, and backup/restore. The public catalogue starts with five researched real listings and links to their particulars. Older sample entries are separated into Examples for existing users. Listing images are decorative illustrations, not property photographs.

Properties and filters are stored in this browser's local storage, not synced across devices. A backup can be exported and restored. An hourly GitHub Actions job uses Brave Search once its API key is configured; search-index prices and availability require confirmation. The refresh button loads the latest published catalogue.

Location filters support area-name matching. Radius searches use straight-line miles from Ludlow, Shrewsbury, Dudley, Llandrindod Wells, or custom latitude/longitude. Properties without coordinates are excluded from radius results unless missing details are explicitly included. A map/address lookup is not connected yet.

Make focused commits describing each change. Update this checklist as milestones are completed.
