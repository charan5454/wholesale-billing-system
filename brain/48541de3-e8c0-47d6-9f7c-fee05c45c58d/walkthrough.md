# Walkthrough: Mobile Refinements & Bug Fixes

I have completed the requested branding refinements and resolved the issues with the login modal and PDF downloads.

## Changes Made

### 1. Branding Refinements (Mobile)
- **Bigger Title**: Increased the font size of "Kanamoni's Interest Calculator" from `1.0rem` to `1.4rem`.
- **Lower Alignment**: Added top padding to the title to align it further down on small screens.
- **Notch Support**: Added `viewport-fit=cover` to the meta tags to ensure the app looks proper on modern phones with notches.

### 2. Form & Modal Visibility (Mobile)
- **Visible Labels**: Added explicit labels above the input boxes in the "Add Borrower" form. Previously, it was using only placeholders, which were hard to see in dark mode.
- **Placeholder Contrast**: Boosted the contrast of placeholder text across the entire app to make it easier to see where to type.
- **z-index Conflict**: Fixed the issue where the mobile navbar menu was covering the login and borrower modals.
- **Auto-Zoom Fix**: Ensured the screen doesn't zoom in automatically when tapping a form field.

### 3. PDF Download Stability
- **Scrubbed Unicode**: The Rupee symbol (`₹`) and certain regional date characters were causing the PDF generator to fail. I have replaced `₹` with `Rs.` and used a standardized date format (`toDateString`) to ensure the download works every time.
- **Verified Reports**: Both the main calculation report and the Borrower Settlement reports are now downloading correctly.

### 4. Navigation Improvement
- **Auto-Close Menu**: The mobile navbar menu now closes automatically after you click "Borrowers", "History", or "Login".


## Verification Results

The changes were applied specifically for screen widths under `576px` where applicable, ensuring the desktop website remains unchanged.

