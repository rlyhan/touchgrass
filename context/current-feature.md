# Current Feature

## Browse uses Sanity content

Parent branch: `qa`

Browse reads activities straight from `@touchgrass/mocks` on the device, so its cards show the mock Unsplash images instead of the Sanity ones, and Sanity-only activities never appear. Move browse onto the API, which serves the merged Sanity + mock list.

### Tasks

1. `fix:` `GET /activities/search?q=&offset=&limit=` on the API; mobile search calls it
2. `fix:` `GET /activities/random?count=` on the API; the browse random set calls it
