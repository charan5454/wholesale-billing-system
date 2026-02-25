# Enhancing Shop Details & Payments

Improve the vendor details view with better clarity, bill details, and flexible payment dates.

## User Review Required

> [!NOTE]
> I will be renaming "Record Payment" to "Add Paid Money" and "Payment History" to "Amount paid after purchase" as requested to make the interface more understandable.

## Proposed Changes

### [MODIFY] [db.js](file:///c:/Users/kanam/.gemini/antigravity/scratch/wholesale-vendor-system/src/utils/db.js)
- Update `addPayment(payment)` to check for an existing `date` in the `payment` object instead of always using `new Date()`.

### [MODIFY] [VendorDetails.jsx](file:///c:/Users/kanam/.gemini/antigravity/scratch/wholesale-vendor-system/src/components/VendorDetails.jsx)
- **Labels**:
    - Rename "Record Payment" button to "**Add Paid Money**".
    - Rename "Payment History" header to "**Amount paid after purchase**".
- **Payment Modal**:
    - Add a date input field to allow users to select when the repayment happened.
- **Bill Details**:
    - Implement a state to track which bill's details are visible.
    - Make bill entries clickable to toggle the display of items (Name, Qty, Price) bought in that bill.

## Verification Plan

### Manual Verification
- Go to "Shops" and select a shop.
- Verify labels are updated.
- Click "Add Paid Money", select a date, and confirm the payment appears in history with that date.
- Click on a bill in "Purchase History" and verify it expands to show the items and quantities.
