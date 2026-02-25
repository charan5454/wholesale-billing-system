# Smart Job Seeking and Hiring Platform - Implementation Plan

## Goal Description
Build a full-stack web application connecting job seekers and recruiters. The platform allows job seekers to create profiles and recruiters to search for candidates based on skills. It includes authentication, profile management, and an SMS notification system for contacting candidates.

## Proposed Changes

### Database Config
#### [NEW] [config.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/config.php)
- Database connection settings using PDO.

### Database Setup
#### [NEW] [database.sql](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/database.sql)
- SQL script to create `users` (seekers/recruiters), `profiles`, `skills`, and `notifications` tables.

### Frontend & Shared
#### [NEW] [index.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/index.php)
- Landing page.
#### [NEW] [header.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/includes/header.php)
- Bootstrap navigation bar.
#### [NEW] [footer.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/includes/footer.php)
- Footer section.
#### [NEW] [style.css](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/css/style.css)
- Custom styles.

### Authentication
#### [NEW] [register.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/auth/register.php)
- Registration form for both roles.
#### [NEW] [login.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/auth/login.php)
- Login form.
#### [NEW] [logout.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/auth/logout.php)
- Logout logic.

### Job Seeker
#### [NEW] [profile_edit.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/seeker/profile_edit.php)
- Form to edit profile details, skills, and resume.
#### [NEW] [dashboard.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/seeker/dashboard.php)
- View own profile status.

### Recruiter
#### [NEW] [dashboard.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/recruiter/dashboard.php)
- Search interface and results list.
#### [NEW] [view_profile.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/recruiter/view_profile.php)
- Detailed view of a candidate.
#### [NEW] [contact_candidate.php](file:///c:/Users/kanam/OneDrive/Antigravity%20Codes/recruiter/contact_candidate.php)
- Logic to send SMS (or simulate it).

## Verification Plan
### Automated Tests
- None planned for this scope (manual verification preferred for UI/UX).
### Manual Verification
- Register a Job Seeker.
- Create a Profile.
- Register a Recruiter.
- Search for the Job Seeker by skill.
- View Profile.
- Click "Contact" and verify "SMS sent" message.
