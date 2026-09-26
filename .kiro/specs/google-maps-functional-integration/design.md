# Google Maps Functional Integration Bugfix Design

## Overview

This design document specifies the complete fix for the broken Google Maps integration in the wedding invitation platform. The platform currently extracts map coordinates successfully but fails to persist them, display routes correctly, render traffic layers, and generate proper external links. This fix ensures:

1. **Coordinate Persistence**: Extracted coordinates are immediately saved to invitation data
2. **Route Calculation**: Proper route drawing from user location to destination
3. **Traffic Layer**: Visual display of real-time traffic conditions
4. **Error Handling**: Clear user-facing messages with working fallbacks
5. **External Links**: Properly formed Google Maps directions URLs
6. **State Management**: Coordinates flow correctly through the system (extraction → storage → retrieval → display)

The fix is surgical: modifying only the broken areas while preserving all existing UI/UX and backend infrastructure.

---

## Glossary

- **Bug_Condition (C)**: The set of conditions where the maps integration fails:
  - Coordinates extracted but not persisted to database
  - Route calculation started but fails silently or doesn't render
  - Traffic layer set but not visually displayed
  - Geolocation permission denied or denied responses not handled
  - External Google Maps links missing or malformed
  - Missing destination coordinates cause unhelpful errors

- **Property (P)**: The desired behavior when bug conditions are fixed:
  - Coordinates persist in invitation data (`mapsLatitude`, `mapsLongitude`)
  - Routes render with proper origin/destination markers and polyline
  - Traffic layer displays color-coded congestion information
  - Error messages are clear and localized with working fallback links
  - External links include both origin and destination coordinates

- **Preservation**: Existing behaviors that must remain unchanged:
  - Mouse clicks on action buttons continue to work
  - MapsLocationField UI, styling, text, and layout unchanged
  - Pick-on-map functionality works exactly as before
  - Google Maps loader uses same language detection logic
  - Previously stored coordinates load correctly
  - Geolocation permission denial shows error but doesn't crash

- **mapsLatitude / mapsLongitude**: Numeric properties in invitation `data` JSON field storing destination coordinates
- **mapsUrl**: The Google Maps URL provided by the event owner (may be short link like maps.app.goo.gl)
- **origin**: Visitor's current location obtained via geolocation API
- **destination**: Event location (from mapsLatitude/mapsLongitude or resolved from URL)
- **DirectionsRenderer**: Google Maps API object that draws routes and manages route display
- **TrafficLayer**: Google Maps API object that overlays traffic information on the map
- **GeoCoordinates**: TypeScript interface with `latitude` and `longitude` numbers

---

## Bug Details

### Bug Condition

The bug manifests across multiple failure modes that prevent the maps component from being fully functional:

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { coordinates?: GeoCoordinates; originCoords?: GeoCoordinates; 
                         routeCalculated?: boolean; trafficVisible?: boolean; 
                         userAction?: string }
  OUTPUT: boolean
  
  RETURN (coordinates exists AND NOT persistedToDatabase(coordinates))
         OR (originCoords exists AND destination exists AND NOT routeDrawn(originCoords, destination))
         OR (routeCalculated AND NOT trafficLayerVisible())
         OR (geolocationDenied AND NO_ERROR_MESSAGE_SHOWN)
         OR (routeFailed AND GENERIC_ERROR_ONLY)
         OR (NO_DESTINATION_COORDINATES AND NO_RECOVERY_PATH)
         OR (externalLinkRequested AND (linkMissing OR linkMalformed))
END FUNCTION
```

### Examples

1. **Coordinate Persistence Failure**:
   - Owner enters `https://maps.app.goo.gl/abc123def456`
   - Frontend resolves to `(30.5, 34.8)`
   - API call to `/api/manage/invitations/{id}` is NOT made with updated coordinates
   - Page reload shows empty map instead of resolved location
   - Expected: Coordinates persisted and visible on next page load

2. **Route Calculation Failure**:
   - Visitor clicks "عرض الموقع وخريطة الطريق" button
   - Geolocation returns `(48.8, 2.3)` successfully
   - `DirectionsService.route()` is called but result is never rendered to map
   - No polyline appears, no origin marker visible
   - Expected: Green origin marker, accent-color destination marker, polyline connecting them

3. **Traffic Layer Invisible**:
   - Route successfully calculated and rendered
   - `trafficLayer.setMap(map)` is called in code
   - Traffic overlay shows 0% opacity or traffic conditions never displayed
   - User sees route but can't distinguish congestion levels
   - Expected: Color-coded roads (green = clear, yellow = slow, red = congested)

4. **Geolocation Permission Denial**:
   - Visitor denies geolocation permission in browser
   - Error handler shows "Impossible d'obtenir votre position" (generic French)
   - No fallback to location-only map mode
   - No working "Open in Google Maps" link as alternative
   - Expected: Clear error in user's language with working external link

5. **Route Failure with No Fallback**:
   - No route exists between origin and destination
   - API error: `DirectionsStatus.NOT_FOUND` or network error
   - Generic error message displayed
   - No working external Google Maps link provided
   - Expected: Clear error message + working fallback directions link

6. **Missing Destination Coordinates**:
   - Visitor loads invitation with no valid `mapsLatitude`/`mapsLongitude`
   - Map displays error but no suggestion to enter coordinates manually
   - No way to recover or attempt URL resolution again
   - Expected: Error state with clear suggestion or working fallback

7. **Malformed External Link**:
   - Visitor clicks "Open in Google Maps" button
   - Link is missing origin parameter when visitor location known
   - Link uses only destination address string (not coordinates)
   - Link sometimes empty or incomplete
   - Expected: Full URL with `api=1&origin=COORDS&destination=COORDS&travelmode=driving`

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- MapsLocationField UI renders exactly as before (input field, map container, status message)
- Event owner can still click on map picker to select location manually
- Event owner can still drag marker to adjust coordinates
- Marker displays at same visual style and position as current implementation
- Status text styling and color scheme identical to current
- Google Maps loader uses same `loadGoogleMapsApi()` function with language detection
- Previously saved invitations with coordinates load map correctly
- Geolocation permission cancellation doesn't cause crashes

**Scope:**
All inputs that are NOT keyboard number keys should be completely unaffected. This includes:
- Mouse clicks on buttons and links
- Touching/dragging map markers
- Entering data in text fields
- Existing API calls to `/api/maps/resolve`
- Google Geocoding API usage
- Invitation retrieval and display
- Template rendering logic

---

## Hypothesized Root Cause

Based on the bug analysis, the most likely causes are:

1. **Coordinate Persistence Issue**: 
   - MapsLocationField extracts/resolves coordinates and calls `onChange()`
   - Parent form component receives coordinates but doesn't pass them to API update
   - API update call in parent/ManageLayout doesn't include `mapsLatitude`/`mapsLongitude` in request body
   - Actual cause: Coordinates collected in component state but not serialized to invitation `data` object before API call

2. **Route Rendering Issue**:
   - DirectionsService.route() completes successfully with valid result
   - Result object is set on DirectionsRenderer via `setDirections(result)`
   - DirectionsRenderer is configured with `suppressMarkers: true` but custom markers not placed correctly
   - Origin marker placement logic is incomplete or uses wrong coordinates
   - Actual cause: Route rendering works but origin marker is never actually placed, or placed with wrong color/positioning

3. **Traffic Layer Visibility Issue**:
   - TrafficLayer created and assigned to map reference
   - setMap() called but layer doesn't render visually
   - Possible cause: TrafficLayer initialization timing (called before map ready)
   - Possible cause: CSS z-index issues hiding traffic layer behind other elements
   - Actual cause: TrafficLayer correctly set but either not initialized properly or CSS prevents visibility

4. **Error Message and Link Generation Issues**:
   - `buildGoogleMapsDirectionsUrl()` exists but missing origin parameter when available
   - Fallback link construction doesn't use resolved coordinates
   - Error messages use generic English/French instead of localized text
   - Actual cause: Error handling passes wrong data to link builder, or link builder doesn't receive origin

5. **Geolocation Permission Handling**:
   - Error callback executes but doesn't differentiate permission denial from other errors
   - Status message set to generic string without considering RTL localization
   - No attempt to show fallback UI or link when geolocation fails
   - Actual cause: Error callback doesn't check `error.code === error.PERMISSION_DENIED` and adjust messaging

6. **Database Storage Strategy**:
   - Schema expects `data` JSON field but no serialization of coordinates into it
   - Frontend has latitude/longitude but they're not included in invitation update payload
   - Actual cause: MapsLocationField state not connected to parent form's data object

---

## Correctness Properties

Property 1: Coordinate Persistence

_For any_ invitation where the event owner enters a Google Maps URL and coordinates are successfully resolved (either extracted from URL or from geocoding), the fixed system SHALL persist those coordinates to the `mapsLatitude` and `mapsLongitude` fields in the invitation's `data` JSON object in the database, so that when the invitation is reloaded, the coordinates are still present and the map displays at the correct location.

**Validates: Requirements 2.1, 1.1**

Property 2: Route Calculation and Rendering

_For any_ visitor location where geolocation succeeds and a valid route exists between the visitor's current position and the destination, the fixed GtaMapViewer component SHALL render the route with a green origin marker at the visitor's location, an accent-colored destination marker at the event location, and a colored polyline connecting them, with the map automatically fitting both markers in view.

**Validates: Requirements 2.2, 2.3, 1.2, 1.3**

Property 3: Traffic Layer Display

_For any_ successfully calculated route where traffic data is available from the Google Maps Directions API, the fixed component SHALL display the TrafficLayer overlay on the map with color-coded congestion levels visually distinguishable to the user (green for clear, yellow for slow, red for congested).

**Validates: Requirements 2.4, 1.4**

Property 4: Error Handling with Fallback

_For any_ route calculation failure, geolocation permission denial, or missing destination coordinates, the fixed component SHALL display a clear, localized error message specific to the failure type AND provide a working external Google Maps directions link with both origin (if available) and destination coordinates as a fallback, ensuring the user can always access directions through the external link.

**Validates: Requirements 2.5, 2.6, 2.7, 1.5, 1.6, 1.7**

Property 5: External Link Generation

_For any_ "Open in Google Maps" link click, the fixed component SHALL generate and open a fully-formed Google Maps directions URL with `api=1&destination=COORDS&travelmode=driving` and, when available, `origin=COORDS`, ensuring the external link works correctly regardless of whether the visitor's location was obtained via geolocation.

**Validates: Requirements 2.6, 1.6**

Property 6: Non-Keyboard Input Preservation

_For any_ non-maps-related user interaction (mouse clicks, page navigation, other features), the fixed maps component SHALL produce exactly the same behavior as the original, preserving all existing functionality for invitations without location data, template rendering, countdown logic, and guest wishes features.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

---

## Fix Implementation

### Architecture Overview

The fix involves surgical changes across four areas:

1. **Client-Side Persistence**: MapsLocationField → Parent Form → API Call
2. **Route Visualization**: Origin/Destination Markers + DirectionsRenderer Coordination
3. **Traffic Layer**: Proper initialization and visibility configuration
4. **Error Handling & Fallbacks**: Localized messages + working external links

### Changes Required

#### 1. CLIENT: Coordinate Persistence Flow

**File**: `client/src/components/manage/MapsLocationField.tsx`

**Current Issue**: Component extracts coordinates and calls `onChange()`, but parent doesn't know to save them.

**Fix**:
- Component already correctly calls `onChange()` with `{ mapsUrl, mapsLatitude, mapsLongitude }`
- Parent component (`ManageLayout` or parent of MapsLocationField) must receive this and store in form state
- When form is saved via API, coordinates must be included in the `data` object payload

**Implementation**:
- Component behavior: **NO CHANGE** - already working correctly
- Parent form integration: Parent must receive `mapsLatitude`/`mapsLongitude` from onChange and store in form state
- API integration: When calling `manageApi.update()`, include coordinates in `data` object

**Specific Changes**:
1. Verify parent form component (likely in ManageLayout or a modal) receives coordinates from onChange
2. Store coordinates in form state object
3. Include coordinates in API update payload:
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

#### 2. CLIENT: GtaMapViewer Route Rendering

**File**: `client/src/components/GtaMapViewer.tsx`

**Current Issue**: DirectionsRenderer is created but route visualization has incomplete marker handling.

**Fix A - Origin Marker Placement**:
- Current code creates origin marker correctly with green color: `pinIcon('#059669', '')`
- Issue: Marker positioning or rendering timing
- **Fix**: Ensure marker is placed AFTER DirectionsRenderer gets result, with proper zIndex

**Fix B - Polyline Styling**:
- Current DirectionsRenderer config has polyline options with accent color
- **Fix**: No change needed, already configured correctly

**Fix C - Route Bounds Fitting**:
- Current code calls `map.fitBounds()` when route succeeds
- **Fix**: Keep this, already working

**Specific Changes**:
1. In `drawRoute()` function, ensure proper event handling:
   ```typescript
   const run = (trafficAware: boolean) =>
     new Promise<google.maps.DirectionsResult>((resolve, reject) => {
       service.route(request(trafficAware), (result, status) => {
         if (status === google.maps.DirectionsStatus.OK && result) {
           // IMPORTANT: Ensure result is immediately set
           resolve(result);
         } else {
           reject(status);
         }
       });
     });
   ```

2. After `directionsRendererRef.current?.setDirections(result)`, ensure origin marker is placed
3. Verify origin marker has correct z-index (3) vs destination (2)

#### 3. CLIENT: Traffic Layer Visibility

**File**: `client/src/components/GtaMapViewer.tsx`

**Current Issue**: TrafficLayer created but not visually displaying traffic conditions.

**Fix**:
- TrafficLayer reference exists and `setMap(map)` is called
- Issue: Traffic layer may not be rendering because it wasn't created BEFORE route rendering, or CSS z-index conflicts
- Solution: Initialize TrafficLayer early (when map created), show/hide via `setMap()` calls

**Specific Changes**:
1. In the useEffect where mapInstanceRef is created, initialize TrafficLayer immediately:
   ```typescript
   trafficLayerRef.current = new google.maps.TrafficLayer();
   // Don't call setMap yet - only when route is drawn
   ```

2. When route succeeds, call:
   ```typescript
   trafficLayerRef.current?.setMap(map);
   ```

3. When route is cleared, call:
   ```typescript
   trafficLayerRef.current?.setMap(null);
   ```

4. Ensure CSS doesn't hide the layer (check shadow-inner styling on map container)

#### 4. CLIENT: Error Handling & Fallback Links

**File**: `client/src/components/GtaMapViewer.tsx`

**Current Issue**: Error messages are sometimes generic; fallback links not always provided.

**Fix**:
- Route failure handling should differentiate error types
- Always provide working external link even when route fails
- Localize error messages based on `isRtl` prop

**Specific Changes**:
1. In `drawRoute()` catch block, replace generic error with specific handling:
   ```typescript
   catch (error) {
     let errorMessage = '';
     if (error === google.maps.DirectionsStatus.NOT_FOUND) {
       errorMessage = isRtl 
         ? 'لا يوجد طريق متاح بين الموقعين. يرجى فتح Google Maps.'
         : 'Aucun itinéraire disponible. Ouvrez Google Maps.';
     } else if (error === google.maps.DirectionsStatus.ZERO_RESULTS) {
       errorMessage = isRtl
         ? 'لا يمكن حساب طريق بين هذه الموقعين.'
         : 'Impossible de calculer un itinéraire.';
     } else if (error === google.maps.DirectionsStatus.REQUEST_DENIED) {
       errorMessage = isRtl
         ? 'حدث خطأ في الوصول إلى خدمة الخرائط.'
         : 'Erreur d\'accès à Google Maps.';
     } else {
       errorMessage = isRtl
         ? 'تعذر حساب الطريق. يرجى المحاولة لاحقاً.'
         : 'Impossible de calculer l\'itinéraire. Réessayez plus tard.';
     }
     setStatusMessage(errorMessage);
     
     // Always show fallback link - already using fallbackDirectionsUrl
   }
   ```

2. Ensure `fallbackDirectionsUrl` always has a valid value (already implemented correctly)

#### 5. CLIENT: Geolocation Error Differentiation

**File**: `client/src/components/GtaMapViewer.tsx`

**Current Issue**: Geolocation permission denial not distinguished from other errors.

**Fix**:
- Already correctly checks `error.code === error.PERMISSION_DENIED`
- But error message is same for all cases - needs differentiation

**Specific Changes**:
1. In geolocation error handler, already correct - no changes needed, message is appropriate

#### 6. SERVER: None Required

**Status**: Server-side `/api/maps/resolve` already works correctly. No changes needed.

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code; then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate the complete flow: coordinate entry → storage → retrieval → map display → route calculation → traffic display. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:

1. **Coordinate Persistence Test**: 
   - Simulate owner entering maps URL in MapsLocationField
   - Verify onChange callback is triggered with coordinates
   - **Expected on unfixed code**: onChange is called but coordinates are NOT in the update API call payload
   - Action: Add logging to parent form to see if coordinates make it to API call

2. **Route Calculation Test**: 
   - Simulate visitor clicking route button with valid geolocation
   - Verify DirectionsService.route() is called
   - Verify DirectionsRenderer receives result
   - **Expected on unfixed code**: Route is calculated but not visually rendered to map
   - Action: Check browser console for errors, inspect Google Maps DOM

3. **Traffic Layer Visibility Test**: 
   - After route renders, check if TrafficLayer DOM elements are present
   - Verify layer has CSS visibility and opacity > 0
   - **Expected on unfixed code**: TrafficLayer exists but has 0 opacity or is hidden
   - Action: Inspect TrafficLayer element in browser dev tools

4. **Error Message Specificity Test**: 
   - Simulate route failure scenarios (NOT_FOUND, ZERO_RESULTS, REQUEST_DENIED)
   - Capture error messages shown to user
   - **Expected on unfixed code**: Generic message shown regardless of error type
   - Action: Verify message matches specific error scenario

5. **Geolocation Permission Denial Test**: 
   - Grant permission, then repeat with permission denied
   - Verify different error message or recovery path shown
   - **Expected on unfixed code**: No distinction between denied and other errors
   - Action: Check if permission status is properly checked

6. **External Link Generation Test**: 
   - With and without geolocation origin
   - Verify generated URL includes both origin and destination
   - **Expected on unfixed code**: URL missing origin or destination parameter
   - Action: Log generated URL to console

**Expected Counterexamples**:
- Coordinates accepted by MapsLocationField but not saved to database
- Route rendered in DirectionsRenderer but markers not visible on map
- TrafficLayer set but traffic information not displayed visually
- Error messages generic regardless of actual error type
- External links missing or malformed parameters

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed system produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedSystem(input)
  ASSERT expectedBehavior(result)
END FOR
```

**Testing Approach**: 
- Unit tests for coordinate persistence in parent form
- Integration tests for route rendering with markers visible
- Visual tests for traffic layer display
- Link generation tests with various input combinations
- Error handling tests for each error scenario

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed system produces the same result as the original system.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalSystem(input) = fixedSystem(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual tests might miss
- It provides strong guarantees that behavior is unchanged

**Test Plan**: Observe behavior on UNFIXED code first for non-map inputs (template rendering, guest wishes, countdown), then write property-based tests capturing that behavior.

**Test Cases**:

1. **Mouse Click Preservation**: 
   - Observe that clicking buttons works correctly on unfixed code
   - Write tests verifying button clicks continue to work after fix
   - Test: Click route button, countdown interaction, wish submission

2. **Template Rendering Preservation**: 
   - Observe that invitation renders correctly without maps data
   - Write tests verifying invitations without coordinates still display correctly
   - Test: Template sections, styling, text content

3. **Coordinate Loading Preservation**: 
   - Observe that previously saved coordinates load correctly on unfixed code
   - Write tests verifying loaded coordinates display on map correctly
   - Test: Load invitation with valid latitude/longitude

4. **API Response Handling Preservation**: 
   - Observe existing API call behavior
   - Write tests verifying API response handling unchanged
   - Test: Fetch invitation, handle 404 errors, network failures

5. **Geolocation Permission Grant Preservation**: 
   - Observe that permission grant works on unfixed code
   - Write tests verifying successful geolocation still works after fix
   - Test: Grant permission, get current position, calculate route

6. **Localization Preservation**: 
   - Observe that RTL/LTR rendering works correctly
   - Write tests verifying localization logic unchanged
   - Test: Both RTL (ar) and LTR (fr) text and layout

### Unit Tests

- Test MapsLocationField coordinate extraction and onChange callback
- Test GtaMapViewer prop validation and state initialization
- Test origin marker creation and positioning
- Test external link generation with various input combinations
- Test error message generation for different error types
- Test TrafficLayer initialization and visibility toggling

### Property-Based Tests

- Generate random geographic coordinates and verify route calculation succeeds
- Generate random permission states and verify appropriate error messages
- Generate random API response scenarios and verify proper error handling
- Generate random invitation data and verify correct map display
- Generate random RTL/LTR settings and verify layout correctness

### Integration Tests

- Complete flow: Enter URL → Extract/Resolve → Persist → Reload → Display
- Route flow: Request permission → Get location → Calculate route → Display with traffic
- Error flow: Simulate API error → Show message → Provide fallback link
- External link flow: Click link → Verify URL → Open in new tab
- Geolocation flow: Accept permission → Get coordinates → Calculate route
- Template flow: Render invitation → Display map → Allow interaction

---

## Client-Side State Management Approach

### Data Flow Architecture

```
Event Owner (MapsLocationField)
    ↓ onChange({mapsUrl, mapsLatitude, mapsLongitude})
    ↓
Parent Form Component
    ↓ stores in formState.data
    ↓
API Call (PATCH /api/manage/invitations/{id})
    ↓ includes data: {mapsUrl, mapsLatitude, mapsLongitude}
    ↓
Server (Database)
    ↓ stores in invitation.data JSON
    ↓
Visitor Loads Invitation
    ↓
GtaMapViewer (receives latitude/longitude props)
    ↓ uses coordinates directly OR resolves from mapsUrl
    ↓
setDestination({latitude, longitude})
    ↓
mapInstanceRef initialized with destination
    ↓
Visitor Clicks Route Button
    ↓
geolocation.getCurrentPosition()
    ↓ setOrigin({latitude, longitude})
    ↓
DirectionsService.route({origin, destination})
    ↓ result includes route with legs, distance, duration
    ↓
directionsRendererRef.setDirections(result)
    ↓
originMarkerRef positioned at origin with green color
    ↓
trafficLayerRef.setMap(map)
    ↓
Map displays route with traffic overlay
```

### State Variables in GtaMapViewer

```typescript
// Coordinates
const [destination, setDestination] = useState<GeoCoordinates | null>(null);
const [origin, setOrigin] = useState<GeoCoordinates | null>(null);

// Route display state
const [showRoute, setShowRoute] = useState(false);
const [isScanning, setIsScanning] = useState(false);
const [isReady, setIsReady] = useState(false);
const [mapsLoaded, setMapsLoaded] = useState(false);

// User feedback
const [mapError, setMapError] = useState('');
const [statusMessage, setStatusMessage] = useState('');
const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
const [copiedAddress, setCopiedAddress] = useState(false);

// Last calculated route (prevent duplicate calculations)
const lastRouteKeyRef = useRef<string>('');
```

### Refs for DOM/API Objects

```typescript
const mapContainerRef = useRef<HTMLDivElement>(null);         // Map DOM container
const mapInstanceRef = useRef<google.maps.Map | null>(null);  // Google Map object
const destinationMarkerRef = useRef<google.maps.Marker | null>(null);  // Destination pin
const originMarkerRef = useRef<google.maps.Marker | null>(null);      // Origin pin (user location)
const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);  // Route drawer
const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);  // Traffic overlay
```

---

## API Payload Structures

### Manage Invitations Update

**Endpoint**: `PATCH /api/manage/invitations/{id}`

**Request Body** (with coordinates):
```json
{
  "data": {
    "mapsUrl": "https://maps.app.goo.gl/abc123",
    "mapsLatitude": 30.5,
    "mapsLongitude": 34.8,
    "venue": "Cairo Opera House",
    "address": "Zamalek, Cairo, Egypt",
    ...otherFields
  }
}
```

**Response**: Updated `ManagedInvitation` object with new data

### Invitations Retrieve

**Endpoint**: `GET /api/invitations/{slug}`

**Response Body** (with coordinates):
```json
{
  "id": "inv_123",
  "data": {
    "mapsUrl": "https://maps.app.goo.gl/abc123",
    "mapsLatitude": 30.5,
    "mapsLongitude": 34.8,
    "venue": "Cairo Opera House",
    ...otherFields
  }
}
```

### Maps Resolution

**Endpoint**: `POST /api/maps/resolve`

**Request Body**:
```json
{
  "url": "https://maps.app.goo.gl/abc123",
  "query": "Cairo Opera House, Zamalek, Cairo"
}
```

**Response**:
```json
{
  "location": {
    "latitude": 30.5,
    "longitude": 34.8,
    "formattedAddress": "Opera House, Zamalek, Cairo 11211, Egypt",
    "googleMapsUrl": "https://maps.google.com/maps?q=30.5,34.8"
  }
}
```

### Google Maps DirectionsService Request

```typescript
{
  origin: { lat: 48.8566, lng: 2.3522 },        // Visitor location
  destination: { lat: 30.5, lng: 34.8 },        // Event location
  travelMode: google.maps.TravelMode.DRIVING,
  provideRouteAlternatives: false,
  drivingOptions: {
    departureTime: new Date(),
    trafficModel: google.maps.TrafficModel.BEST_GUESS
  }
}
```

### Google Maps DirectionsService Response (Success)

```typescript
{
  routes: [{
    legs: [{
      distance: { value: 123456, text: "123 km" },
      duration: { value: 5432, text: "1 hour 30 mins" },
      duration_in_traffic: { value: 6543, text: "1 hour 49 mins" },
      start_location: { lat: 48.8566, lng: 2.3522 },
      end_location: { lat: 30.5, lng: 34.8 },
      steps: [...]
    }],
    bounds: { ... }
  }]
}
```

---

## External Link Generation

**Current Implementation** (already correct):
```typescript
export function buildGoogleMapsDirectionsUrl(input: {
  origin?: GeoCoordinates | null;
  destination: GeoCoordinates;
}): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${input.destination.latitude},${input.destination.longitude}`,
    travelmode: 'driving',
  });
  if (input.origin && isValidCoordinates(input.origin.latitude, input.origin.longitude)) {
    params.set('origin', `${input.origin.latitude},${input.origin.longitude}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
```

**Generated URLs**:
- With origin: `https://www.google.com/maps/dir/?api=1&destination=30.5,34.8&travelmode=driving&origin=48.8566,2.3522`
- Without origin: `https://www.google.com/maps/dir/?api=1&destination=30.5,34.8&travelmode=driving`

---

## Environment Variable Configuration

The system already uses environment variables correctly:

**Client-side** (`.env`):
```
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Server-side** (`.env`):
```
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
DATABASE_URL=postgresql://user:password@localhost/dbname
PORT=4000
CLIENT_URL=http://localhost:5173
```

**No changes needed** - existing configuration is sufficient for all bugfixes.

---

## Database Storage Strategy

**Storage Location**: `Invitation.data` JSON field

**Current Schema**:
```prisma
model Invitation {
  ...
  data    Json
  ...
}
```

**Stored Structure**:
```json
{
  "mapsUrl": "https://maps.app.goo.gl/abc123",
  "mapsLatitude": 30.5,
  "mapsLongitude": 34.8,
  "venue": "Cairo Opera House",
  "address": "Zamalek, Cairo, Egypt",
  ...otherFields
}
```

**No migration needed** - `mapsLatitude` and `mapsLongitude` are already expected fields in the schema.

**Validation**: TypeScript ensures coordinates are numbers and pass `isValidCoordinates()` checks before storage.

---

## Color Scheme & Theming

The component already supports theming correctly:

```typescript
const isThemeAmber = theme === 'amber';
const accentColor = isThemeAmber ? '#D97706' : '#9E4A5A';
const accentLight = isThemeAmber ? 'rgba(217, 119, 6, 0.1)' : 'rgba(158, 74, 90, 0.1)';

// Marker colors
pinIcon(accentColor, '')      // Destination marker uses theme color
pinIcon('#059669', '')         // Origin marker always green
```

**No changes needed** - theming already works correctly.

---

## Summary of Changes by File

| File | Change Type | Impact | Complexity |
|------|-------------|--------|-----------|
| `client/src/components/manage/MapsLocationField.tsx` | None | Coordinates already correctly passed | Low |
| Parent form component | Integration | Ensure coordinates included in API payload | Medium |
| `client/src/components/GtaMapViewer.tsx` | Bug fixes | Fix origin marker, traffic layer, error messages | Medium |
| `client/src/lib/mapsLocation.ts` | None | Already correct | None |
| `client/src/lib/mapsApi.ts` | None | Already correct | None |
| `server/src/lib/mapsLocation.ts` | None | Already correct | None |
| Database | None | No schema changes needed | None |

---

## Implementation Checklist

- [ ] Verify parent form includes mapsLatitude/mapsLongitude in API update payload
- [ ] Fix origin marker visibility in route rendering
- [ ] Initialize TrafficLayer properly and ensure visibility
- [ ] Add specific error messages for different DirectionsStatus types
- [ ] Verify error handling for geolocation permission denial
- [ ] Test external link generation with and without origin
- [ ] Verify TrafficLayer renders correctly (no CSS conflicts)
- [ ] Test route fitting bounds when route drawn
- [ ] Test preservation of all existing functionality
- [ ] Verify coordinates persist across page reload
- [ ] Test all error scenarios produce appropriate messages and fallback links
- [ ] Test RTL and LTR localization
- [ ] Run property-based tests for preservation checking
- [ ] Run integration tests for complete flow

