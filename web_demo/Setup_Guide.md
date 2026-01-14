# 🔐 How to Setup Google Login (OAuth)

To make the "Sign In with Google" button work, you need your own **Google Client ID**.
Follow these steps to generate one for free.

## Step 1: Create a Project
1.  Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Click **"Select a Project"** (top left) > **"New Project"**.
3.  Name it `Honeypot-Demo` and click **Create**.

## Step 2: Configure Consent Screen
1.  In the left menu, go to **APIs & Services > OAuth consent screen**.
2.  Select **External** and click **Create**.
3.  Fill in:
    * **App Name:** TravelCompare
    * **User Support Email:** Your email.
    * **Developer Contact Email:** Your email.
4.  Click **Save and Continue** until you finish (you can skip "Scopes" and "Test Users" for a local demo).

## Step 3: Create Keys (The Important Part!)
1.  Go to **APIs & Services > Credentials** (left menu).
2.  Click **+ CREATE CREDENTIALS** (top bar) > **OAuth client ID**.
3.  **Application Type:** Select **Web application**.
4.  **Name:** `Localhost Client`.
5.  **Authorized JavaScript origins:**
    * Click **ADD URI**.
    * Type: `http://localhost:3001`
    * *(If using Docker/different port, add `http://localhost:8000` too)*.
6.  Click **Create**.

## Step 4: Copy & Paste
You will see a popup with your "Client ID" (a long string ending in `.apps.googleusercontent.com`).

1.  **Copy the Client ID.**
2.  **Open `travel_compare_app/index.html`:**
    * Find `data-client_id="YOUR_CLIENT_ID..."`.
    * Paste your ID there.
3.  **Open `travel_compare_backend/index.js`:**
    * Find `const CLIENT_ID = "YOUR_CLIENT_ID..."`.
    * Paste your ID there.

**Done! Restart your backend (`node index.js`) and the Google Login button will now work.**