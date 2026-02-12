# Timeline Web Integration Walkthrough

This document outlines the changes made to the Miter Saw Timeline Project to enable dynamic data loading from Google Sheets.

## 1. Backend: Google Apps Script (`gas_deployment.gs`)
The GAS script has been completely refactored to align with your updated CSV format.

### Key Changes
- **Header Mapping**: Now supports English headers directly from your CSV:
    - `Released Year` → `year`
    - `Model #` → `model`
    - `Brand` → `brand`
    - `REF URL` → `ref` (Semicolon-separated links)
    - `Image URL` → `image`
- **Spec Extraction**: Mapped technical specs from CSV columns:
    - `Type` → `specs.type`
    - `Blade Diameter` → `specs.blade`
    - `Watt` → `specs.motor`
- **Output Schema**: Returns a structured JSON object grouped by `year`, matching the Frontend's expectation.

## 2. Frontend: Dynamic Data Loading
The static `timelineData` array in `data.js` has been replaced with a live API configuration.

### `data.js`
- Now stores the `API_URL` and `API_KEY` configuration constants.

### `app.js`
- **Async Fetch**: The `init()` function now calls `fetchTimelineData()` to pull data from your GAS web app.
- **Loading State**: Displays a loading spinner while data is being fetched.
- **Spec & Reference Rendering**:
    - `openSidePanel()` now dynamically renders the `specs` object (Type, Blade, Motor, Feature).
    - Checks for `ref` links and renders "Reference Source" buttons for each URL found.

### `index.html` & `style.css`
- Added markup for the **Loading Indicator**.
- Added CSS styles for:
    - `.loading-container` (Centered spinner with pulse animation)
    - `.ref-btn` (Styled buttons for external reference links)
    - `.spec-full-width` (For Key Innovation/Feature text)

## 3. How to Test
1.  **Deploy GAS**: Copy the new content of `gas_deployment.gs` into your Google Apps Script project and deploy it as a Web App (ensure you select "New Version").
2.  **Verify CSV**: Make sure your Google Sheet contains the `Models_Data` tab with the correct English headers (`Released Year`, `Model #`, etc.).
3.  **Run Locally**: Open `index.html` in your browser (via Live Server or directly).
4.  **Confirm**:
    - You should see a "Loading Timeline Data..." spinner.
    - The timeline should populate with years 2007-2025.
    - Clicking a model should open the side panel showing:
        - Correct technical specs (Blade, Motor, etc.)
        - A "REFERENCES" section with clickable buttons if URLs exist.
