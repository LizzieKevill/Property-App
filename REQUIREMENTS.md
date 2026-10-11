# UK Property App requirements

## Goal

A clean, stylish app accessible on a phone that brings UK house listings into one place and helps organise a property search.

## Requested features

- Listings from Rightmove (https://www.rightmove.co.uk/), OnTheMarket (https://www.onthemarket.com/), and LandSale (https://www.landsale.co.uk/).
- Personal use initially: one user's saved properties and folders. Shared folders and separate accounts are outside the initial scope. Cross-device persistence remains an implementation decision.
- Custom folders/categories, with suggested starting folders: Not seen, Seen, Possibilities, and Favourites.
- A favourite/like toggle available directly on each property card.
- "Seen" means the listing has been viewed online, not that the property has been visited in person.
- Track online review separately from the user's decision: disregarded, liked/favourited, or watching. A seen property can have any of these decisions.
- Watching means following whether a listing is still available and how its asking price changes. Keep dated price observations and the last availability check; automatic updates depend on authorised source access, with manual updates as an initial option.
- Share the original listing link through the phone's share sheet, including WhatsApp where available; provide a copy-link fallback.
- Filters for minimum/maximum price in GBP, land area in acres, bedroom count, bathroom count, and location with a radius in miles.
- Location examples include Ludlow and Dudley; these are examples, not fixed search defaults.
- A mobile-first interface with clear cards, easy navigation, and accessible touch controls.

## Decisions still needed

- Clarify whether "off road/slightly off road" means set back from a main road, private access, or another preference.
- Confirm whether one bedroom is sufficient or two is a strict minimum. Proposed inclusive default: one, with an editable minimum.
- Whether properties can belong to multiple custom folders.
- Whether radius means straight-line distance or driving distance. Proposed first version: clearly labelled straight-line distance.

## Personal saved search preferences

- Preferred maximum asking price: GBP 500,000. Listings above this may be included through an explicit, optional over-budget setting; they must be clearly marked and excluded by default.
- Minimum land area: approximately 2 acres; start with an editable 2-acre minimum. Listings with unknown acreage must be identified separately and not presented as matching the minimum.
- Bedrooms: user described "one or two" as the minimum; use an editable filter and confirm the strict threshold before treating two as required.
- Preferred locations: Shropshire and Mid Wales. Location and radius must be changeable; do not lock the search to these areas.
- Property type: detached house.
- Setting: rural, away from densely built-up town areas.
- Road position: off or slightly off the road; the intended access/setback preference needs clarification.
- Condition: renovation properties are welcome, not just move-in-ready homes.
- Potential to build on the land is a consideration. Record planning information and its source where supplied; distinguish confirmed permission, stated potential, and unknown status. Do not infer permission from acreage, rural location, or listing marketing language.
- Apply saved preferences to newly available listings when authorised listing updates are connected. Alert/notification delivery is not yet agreed.
- Support structured filters for numeric details and property type; rural setting, road position, and building potential may need explicit unknown states or manual review when source data is incomplete.

## Listing integration dependency

Automatic combined search requires an authorised source of listing data. Do not promise that public listing pages can simply be imported automatically.

Rightmove's terms restrict scraping and displaying their images/assets in another app without prior written consent. Their datafeed documentation must not be treated as proof of access to a consumer listing search API.

Source reference: https://www.rightmove.co.uk/c/terms-of-use/

An initial saved-property organiser could accept original listing links plus user-entered details while authorised feed options are investigated. This is a proposed staged approach, not a substitute for the requested combined listings feature.

GitHub Pages will host the frontend. Authorised integrations requiring credentials and cross-device saved data may require a separate backend. Private folder data must not be stored in the public repository.

## Suggested additions for consideration

- Notes and viewing dates on each saved property.
- Duplicate detection to identify the same home across multiple websites.
- Optional in-person viewing status, kept separate from the confirmed online "seen" status.
- Saved searches to avoid repeatedly entering filters.
- Backup/export of saved properties.
- Explicit "Not stated" values for missing acreage or bathroom information; never treat missing data as zero.

## Proposed implementation stages

1. Complete GitHub publishing and verify the Pages URL.
2. Investigate authorised data access for the three confirmed source websites.
3. Build mobile property cards, folders, favourites, filters, and sharing using clearly labelled sample data.
4. Add persistent saved properties for personal use, with the storage and cross-device approach agreed before implementation.
5. Connect authorised listing data and verify duplicate handling and missing fields.
