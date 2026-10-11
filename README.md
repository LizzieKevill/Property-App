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
- [ ] Publish repository to GitHub
- [ ] Enable GitHub Pages and verify the live URL
- [ ] Agree listing sources and app requirements
- [x] Build the first property browsing experience with labelled sample data
- [ ] Connect authorised live listing data

## Working locally

Serve the app with `node preview.mjs`, then open `http://127.0.0.1:4173`. It uses JavaScript modules, so opening the HTML directly from the filesystem is not supported. No dependencies or build tools are required.

Run `node tests/model.test.mjs` and `node tests/app.test.mjs` for the filter and interaction checks.

## First version

Field & Home includes editable saved filters, seen/decision tracking, custom folders, favourites, manual listing entry, original-link sharing, notes, manual price observations, and backup/restore. Listings supplied with the app are fictional and labelled. Listing images are decorative illustrations, not property photographs.

Properties and filters are stored in this browser's local storage, not synced across devices. A backup can be exported and restored. Price and availability updates are manual until authorised feeds are connected.

Location filters support area-name matching. Radius searches use straight-line miles from Ludlow, Shrewsbury, Dudley, Llandrindod Wells, or custom latitude/longitude. Properties without coordinates are excluded from radius results unless missing details are explicitly included. A map/address lookup is not connected yet.

Make focused commits describing each change. Update this checklist as milestones are completed.
