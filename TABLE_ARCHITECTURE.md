# TableTap Table & QR Architecture

## 1. Table Architecture
Tables are stored in Firestore under `restaurants/{restaurantId}/tables/{tableId}`.
This allows for easy querying and scalability for multiple restaurants.

## 2. QR Generation Flow
1.  **URL Generation**: Upon creating a table in the admin dashboard, a unique URL is generated: `/r/{restaurantId}/{tableId}`. This URL is stored in the `qrUrl` field of the table document.
2.  **QR Creation**: The QR management dashboard fetches the `qrUrl` and uses `https://api.qrserver.com/v1/create-qr-code/` to dynamically generate a QR code pointing to the full customer ordering URL.

## 3. SaaS Onboarding Workflow
1.  Restaurant signs up.
2.  Admin navigates to the Table Management dashboard.
3.  Admin creates tables, defining names and capacities.
4.  Table documents are created in Firestore.
5.  QR codes are generated for each table, allowing customers to scan and start sessions.

## 4. Restaurant Setup Lifecycle
1.  **Registration**: User registers and creates a restaurant profile.
2.  **Menu Configuration**: Admin sets up the menu.
3.  **Table Setup**: Admin adds tables and prints QR codes.
4.  **Go-Live**: Restaurant begins accepting orders via QR scanning.
5.  **Operation**: Admin monitors orders and session status via the dashboard.

## 5. Real-time Order Architecture
The system utilizes Firestore's `onSnapshot` listener to ensure real-time updates across all dashboards. The [`src/hooks/useOrderLifecycle.ts`](src/hooks/useOrderLifecycle.ts) hook subscribes to the `restaurants/{restaurantId}/sessions/{sessionId}` document. Any change to the `orders` array within a session document triggers a state update in the subscribing component (e.g., Kanban board, staff grid), ensuring that order status changes are immediately reflected across the system.

## 6. Operational Workflow
The order lifecycle follows a clear progression:
1.  **Customer Order**: Customer places an order via the table-specific QR URL, initiating or updating a session.
2.  **Staff/Kitchen**: Orders appear on the kitchen Kanban and staff dashboards in real-time.
3.  **Served**: Kitchen marks as 'ready', staff marks as 'served'.
4.  **Completed**: Once the customer finishes, staff closes the session.

## 7. Order Lifecycle System
Order status transitions (e.g., `pending` -> `accepted` -> `preparing` -> `ready` -> `served` -> `completed`) are handled by `sessionService.updateOrderStatus`. Timestamps are managed within the order object in the session document, capturing the time of each state transition to provide accurate reporting on preparation times and order fulfillment speed.

## 8. Dashboard Architecture
The system uses a modular dashboard approach:
- **Kanban Board**: Provides a visual workspace for kitchen staff to manage orders by status, powered by [`src/components/kitchen/KanbanBoard.tsx`](src/components/kitchen/KanbanBoard.tsx).
- **Table Grid**: Offers staff an overview of table statuses (e.g., available, occupied, billing), powered by [`src/components/staff/TableGrid.tsx`](src/components/staff/TableGrid.tsx).
- **Analytics**: Displays performance metrics like average order time.
- **Shared Hooks**: All components leverage the `useOrderLifecycle` hook and `sessionService` to maintain consistent state and perform actions.
