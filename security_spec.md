# Security Specification & Threat Model

## 1. Data Invariants
1. **Admin Isolation**: Issues must NOT be queryable by general citizens in bulk. Only admins may list all complaints across the city.
2. **Citizen Ticket Access**: Citizens can fetch their own complaints or retrieve a specific complaint by ticket ID (`get`), but cannot list all complaints in the database.
3. **Immutable Identifiers**: `id` and `createdAt` cannot be altered once created.
4. **Valid States & Statuses**: Status can only transition along allowed paths: `submitted` -> `verified` -> `in_progress` -> `resolved`. Once `resolved`, non-admin users cannot alter the ticket.
5. **PII Isolation**: Citizen profile and notifications stored under `/users/{userId}` are strictly readable and writable only by the authenticated owner (`request.auth.uid == userId`) or an admin.
6. **Payload Boundaries**: All string fields are constrained with `.size()` limits. Document IDs must conform to alphanumeric characters and dashes (`isValidId`).

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Public List Query**: An unauthenticated or non-admin user querying `/complaints` to inspect all community complaints. Expectation: `PERMISSION_DENIED`.
2. **Shadow Field Injection**: Creating a complaint with arbitrary ghost attributes (e.g., `isAdmin: true` or `isSuperUser: true`). Expectation: `PERMISSION_DENIED`.
3. **Identity Spoofing**: Citizen setting another user's `userId` as the reporter owner. Expectation: `PERMISSION_DENIED`.
4. **Huge String Attack (Denial of Wallet)**: Submitting a description with 500,000 characters to consume storage quota. Expectation: `PERMISSION_DENIED`.
5. **Path ID Poisoning**: Using path ID `../../../admin` or 1KB junk characters as `complaintId`. Expectation: `PERMISSION_DENIED`.
6. **Unauthorized Status Escalation**: A citizen attempting to update their complaint status directly to `resolved` without admin authorization. Expectation: `PERMISSION_DENIED`.
7. **Cross-User Profile Read**: User B reading `/users/{userA}/profile/main`. Expectation: `PERMISSION_DENIED`.
8. **Cross-User Notification Tampering**: User B attempting to mark User A's notification as read or deleting it. Expectation: `PERMISSION_DENIED`.
9. **Department SLA Tampering**: Non-admin user updating department SLA or officer duty roster. Expectation: `PERMISSION_DENIED`.
10. **Resolved State Tampering**: Modifying a resolved complaint after ticket resolution. Expectation: `PERMISSION_DENIED`.
11. **Spoofed Admin Email**: Attempting admin operations with an unverified email token. Expectation: `PERMISSION_DENIED`.
12. **Malformed Geo-coordinate**: Injecting non-numeric latitude/longitude into complaint location. Expectation: `PERMISSION_DENIED`.

## 3. Test Runner Definition (`firestore.rules.test.ts`)
The test runner asserts that all 12 attack vectors yield `PERMISSION_DENIED` under Firestore rules simulation.
