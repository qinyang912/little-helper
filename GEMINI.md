# Little Helper Point System (小帮手积分系统)

## Project Overview

"Little Helper Point System" is a gamified web application designed to help parents track their children's chores and rewards. It operates as a single-page application (SPA) where children can earn points by completing chores and redeem them for rewards.

**Key Features:**
*   **Gamification:** Points system for chores and rewards.
*   **Roles:** Distinct "Parent" (admin) and "Child" modes.
*   **Multi-user:** Support for tracking multiple children's progress independently.
*   **Persistence:** All data is saved locally using the browser's `localStorage`.
*   **Zero-Dependency:** Pure HTML, CSS, and JavaScript contained in a single file.

## Architecture

The entire application consists of a single file: `index.html`.

### Structure
*   **HTML (Lines 1-381):** Structure and embedded CSS styles.
*   **UI Components (Lines 382-461):** Main interface elements including score display, tabs, and modals.
*   **Logic (Lines 463-654):** JavaScript handling state, DOM manipulation, and persistence.

### Data Model (`localStorage`)
Data is isolated per user where applicable (suffixed with `_userId`).
*   `users`: Array of user objects `{id, name}`.
*   `currentUserId`: ID of the currently selected user.
*   `score_{userId}`: Integer representing current points.
*   `chores_{userId}`: Available chores `{id, icon, name, points}`.
*   `rewards_{userId}`: Available rewards `{id, icon, name, cost}`.
*   `pendingChores`: Global list of chores waiting for parent approval.

## Usage & Development

### Running the App
Since there is no build step or backend, you can run the application directly:

1.  **Open locally:** Double-click `index.html` to open in your default browser.
2.  **Serve locally (optional):**
    ```bash
    python3 -m http.server 8000
    # Access at http://localhost:8000
    ```

### Development Conventions
*   **Language:** The UI is hardcoded in Simplified Chinese (zh-CN).
*   **Styling:** CSS is embedded in the `<head>`. Use standard CSS3 variables and Flexbox/Grid where appropriate.
*   **State:** modify the global variables (`score`, `chores`, etc.) and ensure `localStorage` is updated immediately to persist changes.
*   **Icons:** Emojis are used for all icons to keep the app lightweight.

## Key Functions
*   `switchMode(mode)`: Toggles between Parent and Child views.
*   `completeChore(choreId, points)`: (Parent) Instantly adds points.
*   `submitChore(choreId)`: (Child) Adds a chore to the `pendingChores` queue.
*   `approveChore(pendingId)`: (Parent) Validates a pending chore and awards points.
*   `redeemReward(rewardId, cost)`: Deducts points and records the redemption.
