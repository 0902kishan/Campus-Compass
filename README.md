# Campus Compass - Lost & Found Platform

Campus Compass is a professional lost-and-found platform built with Next.js 15 and Firebase.

## 🚀 How to Run the Project Locally

### 1. Export from Firebase Studio
To run this in **Antigravity** or any other IDE, you first need the project files:
1. In Firebase Studio, click the **Export/Download** button in the top toolbar.
2. This will generate a file named `project.zip`.
3. Move `project.zip` to your local environment (e.g., `C:\Users\kk288\Desktop\slides\project.zip`).
4. Extract the ZIP file.

### 2. Configure Firebase
Create a `.env.local` file in the root directory and add your keys from the [Firebase Console](https://console.firebase.google.com/):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Install & Run
```bash
npm install
npm run dev
```
The app will be live at `http://localhost:9002`.

---

## 🚀 Interview Talking Points

- **Modern Stack**: Next.js 15 App Router for performance and SEO.
- **Robust Forms**: Using `react-hook-form` and `Zod` for strict client-side validation.
- **Real-time Storage**: Visual proof of found items using Firebase Storage with optimistic progress bars.
- **Unified Firebase Logic**: A centralized provider for Auth, Firestore, and Storage to ensure consistent state across the app.
