# Fix Summary: Firestore Order and Session Management

This document summarizes the architecture and improvements made to the order tracking system.

## 1. Firestore Order Flow
Orders are managed within the context of a `session`.
- **Creation**: When a customer places an order, the system checks for an active session for the `tableId`. If none exists, a new session is created in `restaurants/{restaurantId}/sessions`.
- **Management**: Subsequent orders are appended to the existing session document using Firestore transactions to ensure data integrity. Each order is stored as an object within the `orders` array of the `Session` document.

## 2. Realtime Listener Architecture
Dashboards (admin, staff, kitchen) utilize Firestore's `onSnapshot` listener to provide real-time updates.
- **Listener Setup**: The dashboard listens to the `sessions` collection for the specific restaurant, filtered by `where('isActive', '==', true)`.
- **Data Transformation**: When a snapshot update is received, the listener retrieves all active sessions. The dashboard flattens these sessions to extract individual orders for display, mapping each order to its respective `tableId` and `sessionId`.
- **UI Reactivity**: The UI automatically updates based on these snapshot changes, including auto-scrolling to new orders and playing notification sounds on changes.

## 3. Session/Order Relationship
The `session` is the **canonical source** for order tracking.
- An order does not exist independently of a session.
- A session encompasses all orders, total calculations, tax calculations, and payment status for a customer's entire visit at a specific table.

## 4. Fixes Applied
- **Data Model**: Transitioned to a session-centric data model, ensuring all orders are properly grouped and tracked within a single session document.
- **Atomicity**: Implemented Firestore transactions in `sessionService.ts` for appending orders and updating order statuses to prevent race conditions.
- **Efficiency**: Optimized real-time listener usage by querying only active sessions (`isActive: true`), reducing unnecessary reads and improving performance.
- **UI/UX**: Enhanced dashboard reactivity and user feedback with automated order list flattening, auto-scrolling on new orders, and visual status updates.
