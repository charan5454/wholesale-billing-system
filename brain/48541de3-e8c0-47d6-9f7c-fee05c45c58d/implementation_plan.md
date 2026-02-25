# Implementation Plan: Fix Borrower Modal Visibility and Settlement PDF

The goal is to make the borrower form fields clearly visible and ensure the settlement settlement report PDF downloads correctly.

## Proposed Changes

### [Component Name] [interest-calculator]

#### [MODIFY] [index.html](file:///c:/Users/kanam/OneDrive/AntigravityCodes/interest-calculator/public/index.html)
- Add explicit `<label>` tags above all inputs in the `addBorrowerForm`. Placeholders are often hard to read on mobile, especially in dark mode. Adding labels ensures the user knows what each field is for at all times.

#### [MODIFY] [style.css](file:///c:/Users/kanam/OneDrive/AntigravityCodes/interest-calculator/public/css/style.css)
- Add a CSS rule to explicitly set the `::placeholder` color for `.form-control` and `.bg-dark-input` to a higher contrast color (`var(--text-secondary)`).
- Ensure input labels within the borrower modal are consistent with the rest of the app.

#### [MODIFY] [app.js](file:///c:/Users/kanam/OneDrive/AntigravityCodes/interest-calculator/public/js/app.js)
- In `downloadBorrowerPdf`:
    - Use `new Date().toDateString()` instead of `toLocaleString()` to avoid hidden Unicode characters in locale strings.
    - Added a `.replace(/[^a-zA-Z0-9 ]/g, "_")` to the filename to ensure it's valid.
    - Verified that no `₹` symbols are present in any strings passed to `doc.text()`.
- Synchronize `downloadPdf` with these safety improvements.

## Verification Plan

### Manual Verification
- **Borrower Modal**: Open the "Manage Borrowers" modal on mobile. Verify that "Name", "Address", "Age", etc., have visible labels and the placeholders are readable.
- **Settlement PDF**: Add or select a borrower, calculate their settlement, and click "Download Report". Verify that the PDF is generated and downloaded.
- **Main PDF**: Perform a calculation on the main page and verify the "Download Report" still works with the new safety checks.


