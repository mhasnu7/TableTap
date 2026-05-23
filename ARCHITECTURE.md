# TableTap Scalable SaaS Architecture

## Authentication Architecture
- **System**: Uses Firebase Authentication for identity management.
- **Context**: A custom `AuthContext` wraps the entire application, providing user authentication state and fetching additional user data (role, restaurantId) from a Firestore `users` collection.
- **Login**: Implements a phone/OTP/PIN-based flow (placeholder UI).

## Role Architecture
- **Roles**: Defined as `admin`, `waiter`, `kitchen`.
- **RBAC**: Handled client-side in the `dashboard` layout, checking user custom data and redirecting based on the role to `/admin`, `/staff`, or `/kitchen`.

## Firestore Structure
- **`restaurants/{restaurantId}`**:
    - Stores restaurant-specific data (name, logo, banner, theme, subscriptionStatus, ownerId).
    - Enables multi-tenancy.
- **`users/{userId}`**:
    - Stores user profile (name, phone, role, restaurantId, activeStatus).

## Scalable SaaS Design
- **Multi-tenancy**: Achieved by scoping data access to `restaurantId` stored in user profiles and used in database queries.
- **Reusable Components**: Dashboard components (layout, cards, navigation) are built to be reusable across different roles.
- **Typescript**: Centralized type definitions for `User`, `Restaurant`, `Menu`, and `Session` for consistency and safety.
