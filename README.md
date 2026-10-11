
# Campus Compass - Lost & Found Platform

Campus Compass is a full-stack web application designed to help students reunite with lost belongings on campus.

## 🚀 How to Run the Project Locally

### 1. Prerequisites
- **Node.js** (v18 or higher)
- A **Firebase Project** (Create one for free at [console.firebase.google.com](https://console.firebase.google.com))

### 2. Setup Firebase
1. In the Firebase Console, click **Add App** and select **Web**.
2. Register your app (e.g., "CampusCompass-Local").
3. You will see a `firebaseConfig` object. Keep this open.
4. Enable **Firestore Database** in the "Build" menu.
5. Enable **Storage** in the "Build" menu.

### 3. Environment Variables
Create a `.env.local` file in the root directory of your project and paste your keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

### 4. Install & Run
Open your terminal in the project folder and run:
```bash
npm install
npm run dev
```
The app will be live at `http://localhost:9002`.

---

## 📂 How to Put This on GitHub

1. **Create a new repository** on GitHub.
2. **Initialize git** locally:
```bash
git init
git add .
git commit -m "Initial commit: Campus Compass Project"
git remote add origin https://github.com/YOUR_USERNAME/campus-compass.git
git branch -M main
git push -u origin main
```
*Note: The `.env.local` file is hidden by `.gitignore` by default. Do not share your API keys publicly.*

---

## 🚀 Interview Talking Points

- **The Problem**: Campus lost-and-found is usually fragmented (Facebook groups, physical offices).
- **The Solution**: A centralized platform with real-time updates and visual proof.
- **Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, ShadCN UI, and Firebase (Firestore + Storage).
- **Key Feature**: Optimistic UI updates. When a user uploads a photo, it is handled asynchronously by Firebase Storage while the form maintains state, ensuring a smooth user experience.
