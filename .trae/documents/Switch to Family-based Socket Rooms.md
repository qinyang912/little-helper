User is reporting a synchronization issue where only the first parent's actions are synchronized with the child, and vice versa. This is likely due to how socket rooms are joined or how notifications are sent.

### Analysis of Current Implementation

1.  **Room Joining Logic (`socket.on('join-family')`)**:
    ```javascript
    socket.on('join-family', async (userId) => {
      // ...
      // 验证权限：用户只能加入自己的房间
      if (socket.user.id !== userId) {
         // Error ...
         return;
      }
      socket.join(`user-${userId}`);
    });
    ```
    Currently, a user only joins a room named `user-{theirOwnId}`.

2.  **Notification Logic (`notifyFamily`)**:
    ```javascript
    const notifyFamily = async (userId, event, data) => {
      // ...
      if (user.familyId) {
          const familyMembers = await prisma.user.findMany({
              where: { familyId: user.familyId },
              select: { id: true }
          });
          familyMembers.forEach(member => notifyUser(member.id, event, data));
      }
      // ...
    };

    const notifyUser = (userId, event, data) => {
      io.to(`user-${userId}`).emit(event, data);
    };
    ```
    The notification logic *looks* correct on the server side: it finds all family members and emits to each member's individual room (`user-{memberId}`).

### The Problem
The issue might be on the **client-side connection logic**.
-   **Parent Dashboard**: When a parent logs in, they need to receive updates not just about themselves, but about *all* their children.
-   **Child Dashboard**: When a child logs in, they need to receive updates about themselves.

If the `notifyFamily` function iterates over all family members and sends a message to `user-{memberId}`, then:
-   **Parent A** (id: 1) listens to `user-1`.
-   **Parent B** (id: 2) listens to `user-2`.
-   **Child C** (id: 3) listens to `user-3`.

When **Child C** completes a task:
-   Server calls `notifyFamily(3, ...)`.
-   Server finds family members: [1, 2, 3].
-   Server sends to `user-1`, `user-2`, `user-3`.

So theoretically, it *should* work if everyone is listening to their own user room.

**However**, let's check the client-side code (`ParentDashboard.jsx` and `socket.js`).

In `ParentDashboard.jsx`:
```javascript
  // Socket.IO 实时更新
  useEffect(() => {
    if (!parent) return;

    // 连接 Socket
    connectSocket(parent.id);

    // ...
  }, [parent?.id]);
```

In `ChildDashboard.jsx` (I need to check this file, but assuming similar logic):
It likely connects with `user.id`.

**Hypothesis:**
The issue is likely that `notifyFamily` is finding family members correctly, but maybe the "first parent" part of the user's report is a clue.
Wait, if `Parent B` creates a chore, the code does:
`await notifyFamily(userId, ...)` where `userId` is the **child's ID** (because chores are assigned to children).

Let's look at `POST /api/chores`:
```javascript
app.post('/api/chores', authenticateToken, async (req, res) => {
  const { userId, name, points, icon } = req.body; // userId here is the CHILD's ID
  // ...
  await notifyFamily(userId, 'data-updated', { type: 'chore-added', userId });
});
```
Here `userId` is the child. `notifyFamily` finds the child's family members (which includes Parent A and Parent B) and notifies them. This seems correct.

**Alternative Hypothesis: Room Strategy**
Maybe using individual `user-{id}` rooms is inefficient or buggy if connections drop. A better approach for a "Family" app is to have a **Family Room**.
-   When a user logs in (Parent or Child), they join `family-{familyId}`.
-   When an event happens, we simply emit to `family-{familyId}`.
-   This ensures everyone in the family gets the event immediately without iterating through DB users.

**Plan:**
1.  **Server (`server/index.js`)**:
    -   Modify `socket.on('join-family')` to accept a `familyId` (or derive it from the authenticated user token/DB).
    -   Actually, since `socket.user` is available (from token), we can just have a `join-family` event that joins `family-{socket.user.familyId}`.
    -   Update `notifyFamily` to simply emit to `io.to('family-' + user.familyId).emit(...)`.

2.  **Client (`client/src/socket.js`)**:
    -   Update `connectSocket` to pass `familyId` or just handle the new room logic.
    -   Actually, the client just emits `join-family`. We need to make sure it sends the right info or the server handles it.

Let's verify the client code first.

### Refined Plan
1.  **Check Client Code**: Read `client/src/socket.js` and `client/src/pages/ChildDashboard.jsx` to confirm how they connect.
2.  **Server Refactor**:
    -   Change `join-family` to join a shared family room: `family-{familyId}`.
    -   Change `notifyFamily` to broadcast to `family-{familyId}`.
    -   This is much more robust.

**Why this fixes the user's issue**:
The user says "only the first parent...". This might be because the "legacy" logic in `notifyFamily` (the fallback `else` block) was relying on `parentId`.
```javascript
    } else {
        // Fallback for legacy logic (should be rare)
        if (user.role === 'CHILD' && user.parentId) {
             // ...
        } else if (user.role === 'PARENT') {
             // ...
        }
    }
```
If the migration didn't run perfectly or if `familyId` isn't being used correctly, it might fall back here. But I see `user.familyId` check is first.

Wait, looking at `POST /api/chores`:
`const { userId, ... } = req.body`. `userId` is the target child.
`notifyFamily(userId, ...)` -> finds child -> finds family members -> notifies all.

If **Parent B** (who was added later) is logged in, they are listening to `user-{ParentB_ID}`.
If the child is in the same family, `notifyFamily` *should* find Parent B.

Let's switch to the **Family Room** strategy regardless, as it's cleaner and guarantees synchronization for everyone in the family group.

**Steps**:
1.  **Server**: Update `join-family` listener.
    -   It currently takes `userId`.
    -   It should instead look at `socket.user.familyId` and join `family-{familyId}`.
2.  **Server**: Update `notifyFamily`.
    -   Instead of finding all users, just emit to `family-{familyId}`.
3.  **Client**:
    -   Ensure `connectSocket` emits `join-family`.
    -   It seems `ParentDashboard` calls `connectSocket(parent.id)`.
    -   We might need to update `socket.js` to potentially send `familyId` if it's not in the token (but it IS in the token now!).

Let's double check `server/index.js` token generation:
`const token = jwt.sign({ id: user.id, role: user.role, name: user.name, familyId: user.familyId }, SECRET_KEY);`
Yes, `familyId` is in the token.

So, on connection:
`socket.user` has `familyId`.

**Server Change**:
```javascript
  socket.on('join-family', () => { // No args needed, trust the token
      const { familyId } = socket.user;
      if (familyId) {
          socket.join(`family-${familyId}`);
          console.log(`User ${socket.user.id} joined family room ${familyId}`);
      }
  });
```

**Client Change**:
Update `client/src/socket.js` to emit `join-family` without args (or args are ignored).

**Notification Change**:
`notifyFamily` finds the user to get their `familyId` (in case we only have userId), then emits to the room.

This will solve the issue because everyone in the family (Parents A, B, C... and Children) will be in the same Socket.IO room.