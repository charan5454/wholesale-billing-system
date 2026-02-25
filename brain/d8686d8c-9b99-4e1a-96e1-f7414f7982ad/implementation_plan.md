# Interest Calculator Implementation Plan

## Goal Description
Build a responsive full-stack Interest Calculator web application. Users can calculate Simple Interest, Compound Interest, and EMI, visualize growth with charts, and download reports. Registered users can save calculations.

## User Review Required
> [!IMPORTANT]
> **Database Requirement**: This project requires a running **MySQL** server. Please ensure you have MySQL installed and running, and update the database connection credentials in `.env` (or config) once generated.
> **Node.js**: I will use Node.js for the backend. Ensure Node.js and npm are installed.

## Proposed Changes
I will create a new directory `interest-calculator` to contain the project.

### Backend (Node.js/Express)
- **`server.js`**: Main entry point, API routes.
- **`database.js`**: MySQL connection logic.
- **`routes/auth.js`**: Login/Register endpoints.
- **`routes/calculator.js`**: Calculation handling and history saving.

### Database (MySQL)
- **Schema**:
    - `users` table: `id`, `username`, `password_hash`, `created_at`
    - `history` table: `id`, `user_id`, `type`, `principal`, `rate`, `time`, `result`, `date`
    - `borrowers` table: `id`, `user_id`, `name`, `village`, `age`, `amount`, `rate`, `rate_unit`, `given_at`

### Backend (Node.js/Express)
- **`server.js`**: Main entry point, API routes.
- **`routes/borrowers.js`**: (New) Endpoints for adding/listing borrowers.
    - `POST /api/borrowers`: Add new borrower.
    - `GET /api/borrowers`: List all borrowers for user.
    - `PUT /api/borrowers/:id`: (New) Update borrower details.
    - `POST /api/borrowers/:id/calculate`: Calculate interest for specific borrower up to today.

### Frontend (HTML/Bootstrap/JS)
- **`public/index.html`**: Add "Borrower Manager" tab/section.
- **`public/js/app.js`**: Add logic to fetch borrowers and populate calculator.

## Verification Plan
### [Borrower Management]
- **Feature**: Downloadable Settlement Report.
- **Implementation**: Add a "Download PDF" button to the `borrowerCalcResult` section.
- **Library**: Use `jspdf` (already included for main calculator) to generate a professional PDF with principal, interest, time period (30/360), and total.
### [Animations & Polish]
- **Entry Animations**: Use AOS (Animate On Scroll) for smooth fade-up entry of cards.
- **Micro-Interactions**: Implement floating glass orbs in the background.
- **Card Effects**: Add hover-lift and scale transitions.
- **Calculations**: Add a subtle "pulse" effect to result numbers when they update.
### [Borrower Evidence Upload]
- **Storage**: Multi-part form data handled by `multer` saving to an `uploads/` directory.
- **Database**: Add `evidence_path` column to `borrowers` table.
- **Frontend**:
  - Add `<input type="file">` to Add Borrower form.
  - Display thumbnail in Borrower List and settlement details.
  - Support full-screen image viewing.
### [Mobile & External Access]
- **Local Network**: Accessible via `http://<Local-IP>:3000` (Devices must be on same Wi-Fi).
- **Global Access**: Suggest use of `ngrok` to generate a secure public URL.
- **Security**: Advise on firewall settings for Port 3000.
### Automated Tests
- None planned for this mini-project, but I will provide a script to test DB connection.
### Manual Verification
- **Functional**:
    - Calculate SI, CI, EMI and check accuracy.
    - Check Charts rendering.
    - Register a user, log in, save a calculation, view it in history.
    - Download PDF.
- **Responsive**: Check UI on mobile/desktop view sizes.
