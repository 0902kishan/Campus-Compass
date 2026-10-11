# Campus Compass - Lost & Found Platform

Campus Compass is a professional lost-and-found platform built with Next.js 15 and Firebase. It allows campus communities to report found items and connect with owners.

## 🚀 How to Run Locally (in Antigravity or any IDE)

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js 18 or 20 installed on your machine.
- **Firebase Project**: You need a project created at the [Firebase Console](https://console.firebase.google.com/).

### 2. Export & Extract
1. In Firebase Studio, click the **Export** button in the top toolbar to download `project.zip`.
2. Extract the `project.zip` file into a folder on your computer (e.g., `C:\Projects\campus-compass`).

### 3. Setup Environment Variables
Next.js needs your Firebase credentials to connect to the backend.
1. Create a file named `.env.local` in the root of the extracted project folder.
2. Go to your [Firebase Console](https://console.firebase.google.com/) -> Project Settings (gear icon) -> General.
3. Scroll down to "Your apps" and select your Web App (or create one).
4. Copy the values and paste them into `.env.local` like this:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Install & Run
Open your terminal in the project folder and run:
```bash
npm install
npm run dev
```
The app will be live at `http://localhost:9002`.

---

## 🚀 How to Put This on GitHub

1. **Create a Repository**: Go to [GitHub](https://github.com/new) and create a new repository. Do **not** initialize it with a README or license.
2. **Initialize Git Locally**: In your project terminal, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Campus Compass Prototype"
   ```
3. **Connect to GitHub**: Copy the URL of your new GitHub repo and run:
   ```bash
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git branch -M main
   git push -u origin main
   ```
   *Note: Your `.env.local` file is automatically ignored by Git (check `.gitignore`) so your private keys stay safe.*

---

## 🚀 Interview Talking Points

- **Modern Stack**: Built with Next.js 15 App Router for optimal performance.
- **Real-time Data**: Integrated with Firebase Firestore and Storage for instant updates and image handling.
- **Strict Validation**: Uses Zod and React Hook Form for type-safe, user-friendly forms.
- **Professional UI**: Styled with Tailwind CSS and ShadCN components for a polished, responsive look.
