# PWA Conversion Implementation Plan

Convert the existing Node.js + Express app into a PWA to enable offline capabilities (basic) and installation on mobile/desktop.

## Proposed Changes

### Frontend Assets
#### [NEW] [manifest.json](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/public/manifest.json)
- Define app name, icons, and theme colors.

#### [NEW] [icon-192.png](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/public/icon-192.png)
- 192x192 icon for PWA.

#### [NEW] [icon-512.png](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/public/icon-512.png)
- 512x512 icon for PWA.

#### [NEW] [service-worker.js](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/public/service-worker.js)
- Handle basic caching of static assets.

### Frontend Updates
#### [MODIFY] [index.html](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/public/index.html)
- Link `manifest.json`.
- Add `theme-color` meta tag.

#### [MODIFY] [app.js](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/interest-calculator/public/js/app.js)
- Register the service worker on page load.

## Verification Plan

### Automated Tests
- None (Visual/Browser based).

### Manual Verification
- Verify PWA installability using Chrome DevTools (Application > Manifest).
- Check Service Worker registration (Application > Service Workers).
- Check for console errors related to PWA.
- Verify icons and theme color.
