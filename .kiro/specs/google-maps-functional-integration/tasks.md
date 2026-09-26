# Google Maps Functional Integration - Implementation Tasks

## Overview

This task list follows the exploratory bugfix workflow:
1. **Explore** - Write tests BEFORE fix to understand the bug
2. **Preserve** - Write tests for non-buggy behavior  
3. **Implement** - Apply the fix with understanding
4. **Validate** - Verify fix works and doesn't break anything

---

## Phase 1: Bug Condition Exploration

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Maps Integration Functional Failures
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists across all failure modes
  - **Scoped PBT Approach**: For each bug scenario, create concrete test case demonstrating the failure:
    - Coordinate persistence: Owner enters maps URL → coordinates extracted but NOT persisted to database on reload
    - Route rendering: Visitor clicks route button with valid location → route calculated but origin marker NOT visible or positioned incorrectly
    - Traffic layer: Route renders successfully → traffic information set but NOT visually displayed to user
    - Error handling: Route calculation fails → generic error message shown instead of specific error type
    - External link: "Open in Google Maps" button clicked → URL missing origin parameter when available
  - Test implementation details from Bug Condition in design (isBugCondition pseudocode)
  - The test assertions should match the Expected Behavior Properties from design
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves bugs exist)
  - Document counterexamples found to understand root cause:
    - Coordinates accepted by MapsLocationField but not saved to database
    - Route rendered in DirectionsRenderer but markers not visible on map
    - TrafficLayer set but traffic information not displayed visually
    - Error messages generic regardless of actual error type
    - External links missing origin parameter
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

---

## Phase 2: Preservation Testing

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Maps Features and Non-Buggy Input Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs and non-maps features:
    - Mouse clicks on buttons (countdown interaction, guest wishes submission) work correctly
    - Template rendering for invitations without coordinates displays correctly
    - Previously saved coordinates (from working installations) load and display correctly
    - API response handling for valid data works as expected
    - Geolocation permission grant and successful location retrieval works
    - RTL/LTR localization renders correctly for both Arabic and French
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For invitations without location data, map section is not displayed
    - For invitations with valid coordinates, map displays at correct location
    - Button clicks trigger expected state changes
    - API calls use same error handling mechanism
    - Language detection and locale switching works correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

---

## Phase 3: Implementation Tasks

- [ ] 3. Fix coordinate persistence in parent form
  
  - [ ] 3.1 Ensure parent form receives and persists coordinates
    - Verify parent form component (ManageLayout or modal) receives `mapsLatitude` and `mapsLongitude` from MapsLocationField onChange callback
    - Store coordinates in parent form state object alongside other invitation data fields
    - When form is submitted via API call to `PATCH /api/manage/invitations/{id}`, include coordinates in request payload:
      ```typescript
      await manageApi.update(invitationId, {
        data: {
          ...existingData,
          mapsUrl: values.mapsUrl,
          mapsLatitude: values.mapsLatitude,
          mapsLongitude: values.mapsLongitude,
        }
      })
      ```
    - Verify coordinates are not null/undefined before inclusion in payload
    - _Bug_Condition: coordinates extracted but NOT included in API update payload_
    - _Expected_Behavior: coordinates persisted to invitation.data JSON in database_
    - _Preservation: Form UI styling and behavior for non-map fields unchanged_
    - _Requirements: 2.1, 1.1_

  - [ ] 3.2 Verify coordinate persistence test now passes
    - **Property 1: Expected Behavior** - Coordinates Persist to Database
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms expected behavior is satisfied
    - Run bug condition exploration test from step 1 with coordinate persistence scenario
    - **EXPECTED OUTCOME**: Test PASSES (confirms coordinate persistence is fixed)
    - Verify that after entering maps URL and saving, coordinates are present in database on page reload
    - _Requirements: 2.1, 1.1_

- [ ] 4. Fix route rendering with proper origin marker visibility
  
  - [ ] 4.1 Implement origin marker placement in route drawing
    - File: `client/src/components/GtaMapViewer.tsx`
    - In the `drawRoute()` function, after DirectionsService.route() succeeds and result is passed to DirectionsRenderer:
      - Ensure origin marker is created AFTER `directionsRendererRef.current?.setDirections(result)` is called
      - Place origin marker at origin coordinates with pinIcon('#059669', '') for green color
      - Set marker zIndex to 3 to appear above polyline
      - Verify marker is appended to map DOM (not just created in memory)
    - Current code creates marker but visibility may be failing due to:
      - Marker positioning after DirectionsRenderer renders (timing issue)
      - Map bounds not fitting both markers after origin marker placed
      - CSS z-index conflicts hiding marker
    - **Fix**: Ensure marker placement happens in correct sequence:
      1. Route succeeds, result obtained
      2. DirectionsRenderer sets route on map
      3. Origin marker created and placed at origin coordinates
      4. Map bounds fitted to include both markers
    - _Bug_Condition: originCoords exist AND destination exists AND origin marker NOT positioned correctly_
    - _Expected_Behavior: Green origin marker visible at visitor location with correct zIndex_
    - _Preservation: Route polyline styling and destination marker colors unchanged_
    - _Requirements: 2.2, 2.3, 1.2, 1.3_

  - [ ] 4.2 Verify route calculation test now passes
    - **Property 1: Expected Behavior** - Route Renders with Visible Markers
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - Run bug condition exploration test from step 1 with route rendering scenario
    - Simulate visitor clicking "عرض الموقع وخريطة الطريق" button with valid geolocation
    - Verify route is calculated and rendered with:
      - Green origin marker at visitor location (latitude, longitude from geolocation)
      - Accent-colored destination marker at event location
      - Colored polyline connecting both markers
      - Map bounds fitted to show both markers
    - **EXPECTED OUTCOME**: Test PASSES (confirms route rendering is fixed)
    - Inspect browser dev tools to verify marker DOM elements are present
    - _Requirements: 2.2, 2.3, 1.2, 1.3_

- [ ] 5. Fix traffic layer visibility
  
  - [ ] 5.1 Initialize and display traffic layer
    - File: `client/src/components/GtaMapViewer.tsx`
    - In the useEffect where map is created, initialize TrafficLayer early:
      ```typescript
      trafficLayerRef.current = new google.maps.TrafficLayer();
      // Don't call setMap yet - only when route is drawn
      ```
    - When route is successfully calculated and rendered:
      - Call `trafficLayerRef.current?.setMap(mapInstanceRef.current);` to display traffic
      - Verify traffic layer has opacity > 0 and is not hidden by CSS
    - When route is cleared or error occurs:
      - Call `trafficLayerRef.current?.setMap(null);` to hide traffic layer
    - Check `client/src/styles.css` for any CSS that might hide traffic layer:
      - Remove any `display: none` or `opacity: 0` on traffic layer elements
      - Ensure `.gm-style-cc` (attribution), `.gm-svpc` (traffic) have appropriate z-index
    - **Current Issue**: TrafficLayer created but either:
      - Not initialized before route rendering (timing issue)
      - CSS z-index conflicts or opacity rules hiding layer
      - Traffic data not loading from API
    - _Bug_Condition: routeCalculated AND trafficVisible AND NOT trafficLayerVisible()_
    - _Expected_Behavior: TrafficLayer displays color-coded congestion (green/yellow/red)_
    - _Preservation: Polyline styling and marker colors unchanged, map interaction works_
    - _Requirements: 2.4, 1.4_

  - [ ] 5.2 Verify traffic layer test now passes
    - **Property 1: Expected Behavior** - Traffic Layer Displays on Map
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - Run bug condition exploration test from step 1 with traffic layer scenario
    - After route is drawn successfully:
      - Verify TrafficLayer DOM elements are present in Google Maps container
      - Verify traffic layer has CSS visibility and opacity > 0
      - Verify traffic information is visually distinguishable (colors for congestion levels)
    - **EXPECTED OUTCOME**: Test PASSES (confirms traffic layer is visible)
    - Inspect browser dev tools to verify traffic overlay is rendering
    - _Requirements: 2.4, 1.4_

- [ ] 6. Add specific error messages and fallback links
  
  - [ ] 6.1 Implement specific error handling for different failure types
    - File: `client/src/components/GtaMapViewer.tsx`
    - In the `drawRoute()` catch block and error handlers, replace generic errors with specific messages:
      - `DirectionsStatus.NOT_FOUND`: "لا يوجد طريق متاح بين الموقعين. يرجى فتح Google Maps." (Arabic) / "Aucun itinéraire disponible. Ouvrez Google Maps." (French)
      - `DirectionsStatus.ZERO_RESULTS`: "لا يمكن حساب طريق بين هذه الموقعين." / "Impossible de calculer un itinéraire."
      - `DirectionsStatus.REQUEST_DENIED`: "حدث خطأ في الوصول إلى خدمة الخرائط." / "Erreur d'accès à Google Maps."
      - Generic route errors: "تعذر حساب الطريق. يرجى المحاولة لاحقاً." / "Impossible de calculer l'itinéraire. Réessayez plus tard."
      - Geolocation permission denied: Already correctly implemented, verify it distinguishes from other errors
      - Geolocation other errors: "تعذر الحصول على موقعك الحالي." / "Impossible d'obtenir votre position."
    - Each error message should use `isRtl` prop to select Arabic or French text
    - Always display error message AND provide working fallback directions link
    - _Bug_Condition: routeFailed AND (GENERIC_ERROR_ONLY OR NO_FALLBACK_LINK)_
    - _Expected_Behavior: Specific localized error message + working external Google Maps link_
    - _Preservation: Status message display format and styling unchanged, no modal text changes_
    - _Requirements: 2.5, 2.6, 2.7, 1.5, 1.6, 1.7_

  - [ ] 6.2 Verify error message test now passes
    - **Property 1: Expected Behavior** - Errors Show Specific Messages with Fallback Links
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - Run bug condition exploration test from step 1 with error handling scenarios:
      - Route NOT_FOUND → specific message displayed + fallback link works
      - Route ZERO_RESULTS → specific message displayed + fallback link works
      - Route REQUEST_DENIED → specific message displayed + fallback link works
      - Geolocation permission denied → specific message displayed + fallback link works
      - Network error → generic error message displayed + fallback link works
    - **EXPECTED OUTCOME**: Test PASSES (confirms error messages are specific and fallback links work)
    - Verify each error scenario produces appropriate message and working external link
    - _Requirements: 2.5, 2.6, 2.7, 1.5, 1.6, 1.7_

- [ ] 7. Verify external link generation
  
  - [ ] 7.1 Validate external link generation with various inputs
    - File: `client/src/lib/mapsApi.ts` - verify `buildGoogleMapsDirectionsUrl()` function
    - This function is already correctly implemented but verify it works for all scenarios:
      - With both origin and destination: generates URL with `origin=COORDS&destination=COORDS&travelmode=driving`
      - With only destination (no geolocation): generates URL with `destination=COORDS&travelmode=driving`
      - Invalid coordinates: rejected before URL generation (isValidCoordinates check)
    - When user clicks "Open in Google Maps" button:
      - Call `buildGoogleMapsDirectionsUrl({origin, destination})` with available coordinates
      - Open link in new tab with `window.open(url, '_blank')`
    - Verify URL format matches: `https://www.google.com/maps/dir/?api=1&destination=...&travelmode=driving&origin=...`
    - _Bug_Condition: externalLinkRequested AND (linkMissing OR linkMalformed OR originMissing)_
    - _Expected_Behavior: Link fully-formed with api=1, destination, travelmode, optional origin_
    - _Preservation: Button styling and click handler behavior unchanged_
    - _Requirements: 2.6, 1.6_

  - [ ] 7.2 Verify external link generation test now passes
    - **Property 1: Expected Behavior** - External Links Include Origin and Destination
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - Run bug condition exploration test from step 1 with external link scenario:
      - With geolocation (visitor location known) → URL includes origin parameter
      - Without geolocation (location-only mode) → URL includes only destination
      - Verify link format is correct and opens in new tab successfully
    - **EXPECTED OUTCOME**: Test PASSES (confirms external links are properly formed)
    - Test both scenarios (with and without origin) to verify URL generation
    - _Requirements: 2.6, 1.6_

---

## Phase 4: Preservation Validation

- [ ] 8. Run preservation property tests
  
  - [ ] 8.1 Verify all preservation tests still pass after fixes
    - **Property 2: Preservation** - Non-Maps Features Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2 to ensure no regressions:
      - Mouse clicks on buttons work identically to before
      - Template rendering for invitations without coordinates identical
      - Previously saved coordinates display correctly
      - API response handling works as before
      - Geolocation permission grant works as before
      - RTL/LTR localization works identically
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    - Verify each preservation test still passes after ALL bugfixes applied
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

---

## Phase 5: Integration and Checkpoint

- [ ] 9. Complete end-to-end integration test
  
  - [ ] 9.1 Test complete coordinate persistence flow
    - Event owner enters Google Maps URL in MapsLocationField
    - Coordinates are extracted/resolved (mapsLatitude, mapsLongitude)
    - Form is submitted and API call is made with coordinates in payload
    - Page reloads and invitation still displays map at correct location
    - Verify coordinates persisted in database

  - [ ] 9.2 Test complete route calculation flow
    - Visitor loads invitation with valid coordinates
    - Visitor clicks "عرض الموقع وخريطة الطريق" button
    - Browser requests geolocation permission and grants it
    - Route is calculated successfully between visitor location and event location
    - Map displays:
      - Green origin marker at visitor's location
      - Accent-colored destination marker at event location
      - Colored polyline connecting both
      - Traffic layer showing congestion levels
    - Map automatically fits both markers in view

  - [ ] 9.3 Test error recovery flow
    - Simulate route calculation failure (API error, no route found, permission denied)
    - Specific, localized error message is displayed
    - "Open in Google Maps" fallback link is available and works
    - Clicking link opens correctly formed Google Maps directions URL in new tab

  - [ ] 9.4 Verify no regressions in non-maps features
    - Countdown timer continues to work
    - Guest wishes submission works
    - Template rendering works for all themes
    - Language switching works (Arabic ↔ French)
    - Copy address button works
    - All button clicks function identically to before fixes

- [ ] 10. Checkpoint - Verify all tests pass and no regressions
  - Run complete test suite to verify:
    - Bug condition exploration test PASSES (confirms bugs are fixed)
    - Preservation property tests PASS (confirms no regressions)
    - All integration tests PASS
    - No console errors or warnings in browser dev tools
    - No new TypeScript compilation errors introduced
  - If any test fails, diagnose root cause and apply targeted fix before marking complete
  - Document any issues found and resolutions applied
  - Confirm with user that all tests pass and system is ready for deployment
  - _Requirements: All requirements 1.1-3.7_

---

## Acceptance Criteria Summary

All tasks are complete when:

1. ✅ Bug condition exploration test demonstrates all bugs on unfixed code (failures expected and documented)
2. ✅ Preservation property tests confirm baseline behavior on unfixed code (tests pass)
3. ✅ Coordinates are extracted from maps URL AND persisted to database
4. ✅ Route calculation displays proper origin/destination markers with polyline
5. ✅ Traffic layer is visible showing color-coded congestion information
6. ✅ Route failures show specific, localized error messages with working fallback links
7. ✅ External "Open in Google Maps" links are properly formed with coordinates
8. ✅ Bug condition exploration test now passes (confirms fixes work)
9. ✅ Preservation property tests still pass (confirms no regressions)
10. ✅ All integration tests pass and no console errors appear
11. ✅ All existing functionality (non-maps) works identically to before fixes

---

## Validation Summary

| Requirement | Task | Validation |
|------------|------|-----------|
| 1.1 Coordinates not persisted | 3.1-3.2 | Coordinates saved to database on API call |
| 1.2 Route rendering incomplete | 4.1-4.2 | Origin marker visible and positioned correctly |
| 1.3 Origin marker integration fails | 4.1-4.2 | Marker placed after DirectionsRenderer renders |
| 1.4 Traffic layer not displayed | 5.1-5.2 | Traffic overlay visually displays congestion |
| 1.5 Route failure generic errors | 6.1-6.2 | Specific error messages for each failure type |
| 1.6 External link missing/malformed | 7.1-7.2 | Link includes both origin and destination |
| 1.7 Missing coordinates unhelpful | 6.1-6.2 | Error message + fallback link provided |
| 2.1 Persistence expected | 3.1-3.2 | Coordinates in database, visible on reload |
| 2.2 Route rendering expected | 4.1-4.2 | Markers and polyline visible on map |
| 2.3 Origin integration expected | 4.1-4.2 | Origin at visitor location with correct styling |
| 2.4 Traffic display expected | 5.1-5.2 | Traffic layer visible with color coding |
| 2.5 Error handling expected | 6.1-6.2 | Specific localized message + fallback link |
| 2.6 External link expected | 7.1-7.2 | Properly formed URL with coordinates |
| 2.7 Missing coords recovery | 6.1-6.2 | Error message suggests fallback navigation |
| 3.1-3.7 Preservation | 8.1, 9.4 | All non-buggy behavior unchanged |

