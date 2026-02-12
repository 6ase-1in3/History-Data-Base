# Timeline Project Implementation Plan

## Overview
Integrate the corrected Miter Saw data (`PT_List_Fixed_Final.csv`) into the Timeline Web Project (`index.html`) via Google Apps Script (GAS) API.

## Phase 1: Data Pipeline Configuration (Backend)
- [ ] **Specs Definition**: Establish a strict schema mapping between CSV columns and Frontend JSON. (See `Timeline_System_Spec.md`)
- [ ] **GAS Script Update**: Refactor `gas_deployment.gs` to:
    - Accept English headers from the CSV (`Released Year`, `Model #`, etc.) instead of legacy Chinese headers.
    - Output the exact JSON structure required by `app.js`.
    - Handle the new `REF URL` field.
    - **[NEW] Implement Spec Parsing Logic**:
        - Parse `Power Supply` to separate Type (Corded/Cordless) and Voltage.
        - Map `Laser` column to `Measure` (Laser/LED/None).

## Phase 2: Frontend Integration
- [ ] **Data Fetch Implementation**:
    - Modify `data.js` (or `app.js`) to switch from static `timelineData` to an async `fetch()` call against the GAS web app URL.
    - Implement a loading state in `index.html`.
    - Add error handling for failed fetches.
- [ ] **UI Enhancements (General)**:
    - Update `openSidePanel` in `app.js` to parse and display the `specs` object correctly (Blade, Motor, RPM).
    - Add a "Reference Link" button in the side panel using the new `ref` field.

### Phase 2.1: Spec Visualization (Color Coding)
- [ ] **Control UI**: Add a Dropdown/Segmented Control for "Display Mode": `[Default, Bevel, Measure, Power, Blade]`.
- [ ] **Legend UI**: Implement a floating Legend component that updates based on Display Mode.
- [ ] **Visual Logic**:
    - **Default**: Standard staggered grey/blue nodes.
    - **Bevel**: Red (Dual) / Blue (Single).
    - **Measure**: Purple (Laser) / Orange (LED/Shadow) / Grey (None).
    - **Power**: Black (Corded) / Green (Cordless).
    - **Blade**: Gradient/Heatmap colors (Cold to Hot) based on 6 size ranges.

## Phase 3: Deployment & Verification
- [ ] **Data Import**: User uploads the updated CSV to the Google Sheet.
- [ ] **Verification**:
    - Verify JSON output from GAS macro.
    - Verify Frontend renders all years (2007-2025).
    - Check Model Details and Reference Links functionality.
    - **Verify Spec Modes**: Toggle all modes and check color accuracy against CSV data.

## Phase 4: UI/UX Refinement (Staggered Layout) [COMPLETED]
- [x] **Staggered Timeline**: Refactor CSS/JS for top/bottom node placement.
- [x] **Era Description Box**: Implement large description card below timeline.

## Phase 5: Specific User Refinements (Current Focus)
- [ ] **Image Readiness**: 
    - Generate a `Model_Image_List.csv` or MD listing all required image filenames based on `Brand_Year_Model` ID pattern.
    - Implementing "Placeholder" logic is already done, but need to ensure naming is standardized.
- [ ] **Timeline Layout Logic**:
    - Ensure Year Block width = `(Model_Count - 1) * ZoomLevel`.
    - Verify consistent node spacing ("X") across all years.
- [ ] **Interactive Features**:
    - **Year Descriptions**: Already implemented (collapsible).
    - **Zoom**: Already implemented (slider).
    - **Lightbox**: Already implemented (click image to zoom).
    - **Side Panel**: Already implemented (click node).
