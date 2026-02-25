# Interest Calculator: Mobile Responsiveness & Android App

This plan outlines the steps to make the Interest Calculator web app mobile-responsive and build a companion Android WebView application.

## User Review Required

> [!IMPORTANT]
> The web application will be updated with a viewport meta tag and CSS changes to ensure it fits perfectly on mobile screens (360px - 412px and above).
> The Android project will be fully generated as requested.

## Proposed Changes

### Web Application (Responsiveness & Alignment)

#### [MODIFY] [style.css](file:///c:/Users/kanam/OneDrive/Antigravity Codes/interest-calculator/public/css/style.css)
- Remove `position: absolute` from navbar in layout.
- Add `.navbar-collapse` styling for mobile to include a glass background and padding.
- Ensure `.navbar-brand` wraps correctly or scales down on mobile.
- Adjust `.bg-gradient-custom` padding to account for the navbar.
- Ensure card padding is consistent on mobile.

#### [MODIFY] [index.html](file:///c:/Users/kanam/OneDrive/Antigravity Codes/interest-calculator/public/index.html)
- Change navbar class from `position-absolute` to `sticky-top`.
- Adjust container spacing utilities.

### Android Project Structure
I will create a standard Android Studio project structure in the `interest-calculator-android` directory.

#### [NEW] [MainActivity.java](file:///c:/Users/kanam/OneDrive/Antigravity Codes/interest-calculator-android/app/src/main/java/com/example/interestcalculator/MainActivity.java)
Handles WebView initialization, JavaScript enablement, back-button navigation, and the loading progress bar.

#### [NEW] [AndroidManifest.xml](file:///c:/Users/kanam/OneDrive/Antigravity Codes/interest-calculator-android/app/src/main/AndroidManifest.xml)
Declares internet permissions, sets the app name, and configures the activity to portrait mode.

#### [NEW] [activity_main.xml](file:///c:/Users/kanam/OneDrive/Antigravity Codes/interest-calculator-android/app/src/main/res/layout/activity_main.xml)
Defines the layout containing the `WebView` and a `ProgressBar`.

#### [NEW] [build.gradle](file:///c:/Users/kanam/OneDrive/Antigravity Codes/interest-calculator-android/app/build.gradle)
Configures app dependencies and SDK versions.

## Verification Plan

### Manual Verification
1. Open the web app in a browser and resize to 360px/412px width to verify layout.
2. Build and run the Android app in an emulator to ensure it loads the site and handles navigation correctly.
