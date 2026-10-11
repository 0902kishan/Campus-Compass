# Campus Compass - Lost & Found Platform

Campus Compass is a professional lost-and-found platform built with Next.js 15 and Firebase. It allows campus communities to report found items and connect with owners.

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js 18 or 20 installed.
- **Git**: Installed on your machine.

### 2. Export & Extract
1. In Firebase Studio, click the **Export** button in the top toolbar to download `project.zip`.
2. Extract the `project.zip` file into a folder on your computer.

### 3. Setup Environment Variables
Next.js needs your Firebase credentials. Create a file named `.env.local` in the root of the project folder and paste these values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCH3augQlsSaiu-n76GO1sHDRGfCYjKfm4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=campus-compass-y065w.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=campus-compass-y065w
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=campus-compass-y065w.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=42024244906
NEXT_PUBLIC_FIREBASE_APP_ID=1:42024244906:web:5355e849d846057eb3a2d3
```

### 4. Install & Run
Open your terminal in the project folder and run:
```bash
npm install
npm run dev
```
The app will be live at `http://localhost:9002` (or the port shown in your terminal).

---

## 🚀 How to Put This on GitHub

1. **Create a Repository**: Go to [GitHub](https://github.com/new) and create a new repository named `campus-compass`.
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

---

## 🚀 Interview Talking Points

- **Modern Stack**: Built with Next.js 15 App Router for optimal performance.
- **Real-time Data**: Integrated with Firebase Firestore and Storage for instant updates and image handling.
- **Strict Validation**: Uses Zod and React Hook Form for type-safe, user-friendly forms.
- **Professional UI**: Styled with Tailwind CSS and ShadCN components for a polished, responsive look.
