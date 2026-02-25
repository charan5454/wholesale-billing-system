# Enhancing Borrower Interest Calculations

This plan outlines the changes needed to set the Rupee (₹) as the default currency and implement precise, date-based interest calculations for borrowers.

## Proposed Changes

### UI Updates
- Set ₹ as the default currency in `index.html`.
- Update the borrower "Action" button in `app.js` to show a detailed breakdown:
    - Current Date.
    - Time Period (Years, Months, Days).
    - Calculated Interest and Total.
- Add a small "Details" section or alert to show these results when a borrower "Action" is clicked.

### Calculation Logic
- Implement `getDetailedTimeDiff(start, end)`:
    - Calculates full years, remaining full months, and remaining days.
    - Total months for calculation = `(Years * 12) + Months + (Days / 30)`. (Standard practice is often 30 days per month for interest).
- Update `populateCalculator` to use this higher precision.

## Verification Plan
- Manually test the currency dropdown default.
- Verify borrower interest calculation with specific dates (e.g., loan taken 1 month and 15 days ago).
