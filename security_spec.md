# Security Specification: SIGAP GUGUS 1 CIKAMPEK

This specification defines the strict access control and data validation rules for the application.

## 1. Data Invariants

1. **User Profiles (`/users/{userId}`)**:
   - Any authenticated user can read profiles (necessary for dashboards and leaderboard calculation).
   - A user can only write/update their own profile.
   - Users cannot self-escalate or change their roles (`role`).
   - Profile must contain valid required fields: `id`, `nama`, `sekolah`, `role`.

2. **School Info (`/schools/{schoolId}`)**:
   - Read: Allowed for any signed-in user.
   - Write: Restricted strictly to `PENGAWAS` (Supervisors).

3. **Attendance (`/attendance/{attendanceId}`)**:
   - Read: Users can query their own attendance logic. `KEPALA_SEKOLAH` can read teachers in their school. `PENGAWAS` can read everything.
   - Create: `userId` in incoming matches `request.auth.uid`.
   - Update: Only `KEPALA_SEKOLAH` or `PENGAWAS` can update status/approval fields.

4. **Documents (`/documents/{docId}`)**:
   - Create: `userId` matches `request.auth.uid`. `status` must be `PENDING`.
   - Read: Owner can read. `KEPALA_SEKOLAH` can read teachers' docs of their school. `PENGAWAS` can read all.
   - Update: Creator can update details (if PENDING/REVISION). `KEPALA_SEKOLAH` can score/verify. `PENGAWAS` can validate.

5. **Announcements (`/announcements/{announcementId}`)**:
   - Read: Any signed-in user.
   - Write: Restricted to `KEPALA_SEKOLAH` and `PENGAWAS`.

6. **Permissions (`/permissions/{permId}`)**:
   - Create: `userId` matches `request.auth.uid`. `status` must be `PENDING`.
   - Update: Only `KEPALA_SEKOLAH` can approve/reject.

7. **Material Posts (`/materialPosts/{postId}`)**:
   - Read: All signed-in users.
   - Create: All signed-in users can post.
   - Update: Author can update content, others can only interact through `likes` and `comments` arrays.

8. **Notifications (`/notifications/{notifId}`)**:
   - Create: Any authenticated user (to trigger alerts to others).
   - Read/Update: Strict ownership by `userId` (only owner reads and can mark as read).

---

## 2. The "Dirty Dozen" Malicious Payloads (ABAC Attacks)

Here are 12 specific injection payloads designed to breach system integrity, along with their expected denial behavior.

### Attack 1: Self-Role Escalation on User Profile Creation
**Intent**: A registering user attempts to create their profile with the `role` field set to `PENGAWAS`.
```json
{
  "id": "malicious-user-123",
  "nama": "Hacker Bob",
  "role": "PENGAWAS",
  "sekolah": "Gugus 1 Cikampek"
}
```
*Expected Result*: `PERMISSION_DENIED` - Profiles can only be modified/created if role cannot be self-assigned to higher levels, or is validated against a whitelist.

### Attack 2: Spoofing Owner ID on Attendance Create
**Intent**: Attacker attempts to check-in on behalf of another teacher.
```json
{
  "id": "att-456",
  "userId": "victim-teacher-uid",
  "schoolId": "sd-target",
  "timestamp": "2026-05-24T12:00:00Z",
  "type": "IN",
  "location": "Jakarta"
}
```
*Expected Result*: `PERMISSION_DENIED` - `incoming().userId == request.auth.uid` invariant violated.

### Attack 3: Self-Approving Leave Request (State Shortcut)
**Intent**: A teacher writes a permission approval directly during creation.
```json
{
  "id": "perm-789",
  "userId": "teacher-uid",
  "type": "IZIN",
  "startDate": "2026-05-25",
  "endDate": "2026-05-26",
  "reason": "Family gathering",
  "status": "APPROVED",
  "uploadDate": "2026-05-24"
}
```
*Expected Result*: `PERMISSION_DENIED` - Leave requests must initiate with status `PENDING`.

### Attack 4: Modifying Sibling Document in Sub-Resource
**Intent**: Attempt to update document score field by creator instead of principal.
```json
{
  "id": "doc-555",
  "userId": "teacher-uid",
  "fileName": "rpp.pdf",
  "type": "RPP_LENGKAP",
  "uploadDate": "2026-05-24",
  "status": "APPROVED",
  "score": 99
}
```
*Expected Result*: `PERMISSION_DENIED` - Guru cannot edit scores or change status to APPROVED.

### Attack 5: Poisoning Document Path with Junk ID (Denial of Wallet)
**Intent**: Writing a massive, malicious ID containing terminal patterns to disrupt paths.
```path
/documents/poisonspec-$$$-verylongstring-hacked-hacked-hacked-hacked...
```
*Expected Result*: `PERMISSION_DENIED` - `isValidId()` blocks oversized or malicious patterns.

### Attack 6: Modifying Saved Announcements as Guru
**Intent**: A teacher account tries to update a formal announcement.
```json
{
  "id": "ann-abc",
  "title": "Cikampek Teachers Day Cancelled",
  "content": "All teachers are dismissed.",
  "authorId": "teacher-uid",
  "timestamp": "2026-05-24"
}
```
*Expected Result*: `PERMISSION_DENIED` - Role check (`isKS` or `isPengawas`) failed.

### Attack 7: Cleansing Comments of Other Posts
**Intent**: Removing all comments on a shared material post.
```json
{
  "id": "post-xyz",
  "content": "Authentic content",
  "authorId": "original-author",
  "timestamp": "2026-05-24",
  "comments": []
}
```
*Expected Result*: `PERMISSION_DENIED` - Sibling write or affectedKeys hasOnly checks enforce precise additions.

### Attack 8: Stealing Another User's Notifications
**Intent**: Unauthenticated/non-owner reads personal notifications of another teacher.
*Expected Result*: `PERMISSION_DENIED` - Non-owner access restricted.

### Attack 9: Self-Validating Core Strategic Documents
**Intent**: A school head self-approving their school documents without PENGAWAS supervision.
*Expected Result*: `PERMISSION_DENIED` - Principals cannot approve their own strategic documents in the rules schema.

### Attack 10: Injecting Malicious Types Into Arrays (Likes Array)
**Intent**: Substituting a list of strings (`userId`s) with nested objects in the likes array.
```json
{
  "likes": [{ "malicious_payload": "exploit" }]
}
```
*Expected Result*: `PERMISSION_DENIED` - Validation rules verify elements and status locks.

### Attack 11: Spoofing Location Coordinates of a School
**Intent**: Modifying geo-fencing radius of SD Negeri 1 Cikampek to 100 kilometers.
```json
{
  "id": "sd-cikampek-1",
  "name": "SD Negeri 1 Cikampek",
  "radius": 100000
}
```
*Expected Result*: `PERMISSION_DENIED` - Only PENGAWAS accounts can modify school coordinates.

### Attack 12: Changing Immutable Creation Date
**Intent**: Attempt to alter `createdAt` or `uploadDate` timestamps to backdate attendance/permissions.
```json
{
  "id": "perm-888",
  "uploadDate": "2020-01-01"
}
```
*Expected Result*: `PERMISSION_DENIED` - Immutability of timestamps is enforced on updates.

---

## 3. Test Runner Mock Draft

```typescript
import { assertSucceeds, assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('SIGAP Firestore Rules Policy Verification', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0122226284',
      firestore: {
        rules: require('fs').readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test('Attack 1: Self-Role Escalation should be blocked', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const aliceDb = testEnv.authenticatedContext('teacher-123').firestore();
    
    await assertFails(
      aliceDb.collection('users').doc('teacher-123').set({
        id: 'teacher-123',
        nama: 'Alice',
        role: 'PENGAWAS',
        sekolah: 'SDN Cikampek'
      })
    );
  });

  test('Attack 2: Identity Spoofing should be blocked', async () => {
    const aliceDb = testEnv.authenticatedContext('teacher-123').firestore();
    
    await assertFails(
      aliceDb.collection('attendance').doc('record-99').set({
        id: 'record-99',
        userId: 'victim-teacher-456',
        timestamp: '2026-05-24T12:00:00Z',
        type: 'IN',
        location: 'Off-site'
      })
    );
  });
});
```
