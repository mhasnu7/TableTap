# Authentication Architecture

The application uses a role-based authentication system managed through Firebase Firestore and client-side session persistence.

## Current Auth Flow

1.  **Login:** Users login via the `/login` page by entering their phone number and PIN.
2.  **Validation:** The `AuthContext` performs a query against the `users` Firestore collection matching the provided phone and PIN.
3.  **Authentication State:** Upon successful validation:
    *   The user object (containing `role`, `id`, `restaurantId`, etc.) is stored in the `AuthContext` state.
    *   The user object is persisted in `localStorage` under the key `tabletap_user` for client-side persistence.
    *   A `__session_role` cookie is set with the user's role (`admin`, `waiter`, or `kitchen`) with a 1-day expiration.
4.  **Redirection:** The login page redirects the user based on their role:
    *   `admin` -> `/admin`
    *   `waiter` -> `/staff`
    *   `kitchen` -> `/kitchen`
5.  **Route Protection:** The `middleware.ts` runs on the edge to protect routes starting with `/admin`, `/staff`, and `/kitchen`.
    *   It checks for the presence of the `__session_role` cookie.
    *   If the cookie is missing, it redirects to `/login`.
    *   If the cookie is present, it validates the role against the requested route and redirects to the user's appropriate dashboard if unauthorized (e.g., an `admin` trying to access `/kitchen`).

## Logout
Logout clears the `AuthContext` state, removes the `tabletap_user` item from `localStorage`, and deletes the `__session_role` cookie.

## Route Protection Logic
Route protection is strictly enforced by the Next.js middleware, which ensures that only users with the correct role can access authorized dashboard areas, effectively preventing cross-role access.
