# Audit Report: Firestore Order and Session Schema

## Objective
Audit the current order and session data structure against the required schema requirements.

## Current Schema Analysis
Based on `src/types/session.ts`, the `OrderItem` interface is defined as:

```typescript
export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}
```

## Findings and Discrepancies
The following requirements were compared against the current implementation:

| Requirement | Current Implementation | Status |
| :--- | :--- | :--- |
| Item Name | `name: string` | Satisfied |
| Quantity | `quantity: number` | Satisfied |
| Price | `price: number` | Satisfied |
| Subtotal | Missing | Discrepancy |
| Add-ons | Missing | Discrepancy |
| Notes | Missing | Discrepancy |

### Analysis
The current `OrderItem` structure in `src/types/session.ts` is insufficient to support the required fields (`subtotal`, `add-ons`, `notes`). Since `src/hooks/useOrderLifecycle.ts` and `src/services/sessionService.ts` rely on this `OrderItem` interface for creating and reading order data in Firestore, all related services and hooks will require updates to incorporate these missing fields in both the type definition and the persistence logic.
