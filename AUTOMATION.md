# Automated property discovery

The app now has five researched real listings and an hourly Brave Search discovery job. The job needs a Brave API key before it can run successfully.

## Activate

1. Create an API key at https://api-dashboard.search.brave.com/. Choose a plan that permits storing the result data used by this app and check its request allowance/pricing.
2. In the GitHub repository, open Settings → Secrets and variables → Actions → New repository secret.
3. Set the name to `BRAVE_SEARCH_API_KEY` and put the API key in the value. Never commit the key or put it in website code.
4. Push the setup commit through GitHub Desktop if it has not yet been pushed.
5. Open Actions → Search for properties → Run workflow. Check the run succeeds.

The cron schedule requests a search at minute 17 of every hour (UTC). GitHub can delay scheduled runs, and public repository schedules may be disabled after 60 days without repository activity. This is not a guaranteed exact hourly service.

The default configuration runs 12 API requests per search, about 288 requests per day, before retries or manual runs. There are no automatic billing changes in this repository. Review your provider limits before enabling the schedule.

## What happens

The job searches Rightmove, OnTheMarket and LandSale through Brave's search index. It extracts numeric facts from the returned text and requires an unambiguous price at or below £500,000, at least 2 acres, at least 1 bedroom, a detached title, a rural description, and a supported area. Results that omit these details or contain contradictory figures are skipped.

For known and newly discovered listings, the job reads public gallery metadata from the original listing page. It saves image URLs and short photo captions, without downloading or rehosting the images. Galleries refresh at most once per day after a successful collection. Failed gallery requests retain the previous photos and do not fail the search. When a primary website does not publish accessible gallery metadata, the job tries the property's other known source links. It does not bypass sign-in, access challenges, or blocked requests. Unsupported or unavailable galleries have an original-listing link in the app.

The photo and title buttons open a property detail dialog with all available extracted gallery photos, thumbnail selection, previous/next controls, and source attribution. The original portal may have additional media, including videos or floorplans, which remain accessible via its listing link. Image links can expire or be blocked by their host. Run `node scripts/update-photos.mjs --force` to refresh gallery links separately from Brave discovery.

Automatic matches are labelled as search-index results. Search indexes can lag behind price or availability changes; check original links. This is discovery, not a complete or authoritative live property feed. Access arrangements and permission to build are not inferred. Known sold/under-offer results are not added as new matches; a missing search result does not mark an existing listing sold or remove it.

The researched starter entries retain caveats about tenanted land, major reconstruction, access and planning. No listing has independently verified new-build permission.

## Refresh and search coverage

The app's Refresh listings button fetches the most recent published catalogue. Its Run a new search on GitHub link opens the workflow where the owner can select Run workflow. Website visitors cannot initiate privileged GitHub jobs or access the API key.

Search coverage is configured in `scripts/search-config.json`. The initial coverage is Shropshire and Mid Wales (Powys/Ceredigion). Changing filters in the app affects your browser's view of the catalogue, not the background search coverage; edit the configuration to change discovery areas or thresholds.

## Merging and saved information

Matching listing URLs (ignoring tracking parameters), explicitly linked source listings, or a matching full postcode plus precise address are merged. Generic town names, matching prices or bedrooms alone never trigger a merge. Some genuine cross-site duplicates cannot be identified when an exact address is withheld; those remain separate rather than risk combining different homes.

The app preserves local notes, folders, seen status and decisions while public listing facts update. Price changes create observations. Removed properties are not re-added from the same catalogue ID. Old fictional entries are kept separately in Examples for existing users.

Only public listing facts are committed by the job. Your personal saved decisions and notes remain browser-local. Cross-device sync is still not connected.

## Failure behavior

Missing keys, API failures, timeouts, or malformed responses fail the job before replacing the catalogue. The previous catalogue stays published. The search workflow deploys directly after committing its update, because pushes made by `GITHUB_TOKEN` do not start another workflow.

References: https://api-dashboard.search.brave.com/app/documentation/web-search and https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
