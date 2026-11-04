# Haute Events

## Run it
1. Install Node.js from https://nodejs.org (LTS version)
2. Open a terminal in this folder and run:
   npm install
   npm run dev
3. Open the link it prints (usually http://localhost:5173)

## Backend integration
- The API base URL defaults to `http://localhost:5000`; set `VITE_API_BASE_URL` to override it.
- Authentication uses `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`.
- Provider service management uses the authenticated `/api/services` routes.
- Provider profile reads and writes use `/api/provider-profile` routes.
- Customer browsing remains unavailable from the backend: the current service API only lists a provider's own services and has no public listing or service-details endpoint.

## Folder guide
- index.html            : the single HTML page React fills in
- src/main.jsx          : starts React
- src/App.jsx           : arranges the page sections
- src/components/       : one folder per section (.jsx = structure, .css = styling)
- src/data/siteData.js  : text and lists (edit content here)
- src/styles/global.css : colours, fonts, resets
- src/assets/           : put your images here (e.g. hero.jpg)
