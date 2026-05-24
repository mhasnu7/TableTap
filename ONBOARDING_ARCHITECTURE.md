# Onboarding Architecture

## Architecture
The onboarding flow is built as a multi-step wizard using a React Context (`SetupContext`) to manage state across steps. The data is then submitted to `onboardingService.setupRestaurant`, which orchestrates the creation of resources in Firestore and Storage.

## Firestore Structure
- `restaurants/{restaurantId}`: Stores restaurant metadata.
- `restaurants/{restaurantId}/tables/{tableId}`: Sub-collection for table management.
- `users`: New admin user linked to `restaurantId`.

## Image Upload Flow
Images are uploaded to Firebase Storage under `restaurants/{restaurantName}/{type}`. Download URLs are then stored in the Firestore `restaurant` document.

## Restaurant Setup Lifecycle
1. User enters info in steps (Context updated).
2. On click "Finish", `setupRestaurant` is called.
3. Images are uploaded to Storage.
4. Restaurant, Tables, and User are created in Firestore.
5. User is redirected to `/admin`.
