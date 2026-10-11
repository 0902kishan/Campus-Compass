# Campus Compass - Lost & Found Platform

Campus Compass is a full-stack web application designed to help students reunite with lost belongings on campus. It provides a centralized, easy-to-use interface for reporting found items and searching for lost ones.

## 🚀 How to Run the Project

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) installed on your machine.

### 2. Setup Environment Variables
Create a `.env.local` file in the root directory and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Install Dependencies
Run the following command to install all necessary packages:
```bash
npm install
```

### 4. Start Development Server
Run the app locally:
```bash
npm run dev
```
The app will be available at `http://localhost:9002` (or the port specified in your console).

---

## 📂 How to Put This on GitHub

1. **Create a new repository** on [GitHub](https://github.com/new). Do not initialize it with a README or License.
2. **Open your terminal** in the project folder and run:
```bash
# Initialize git
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Campus Compass Project"

# Link to your GitHub repo (replace URL with yours)
git remote add origin https://github.com/YOUR_USERNAME/campus-compass.git

# Push to GitHub
git branch -M main
git push -u origin main
```
*Note: Ensure your `.env.local` is in `.gitignore` to keep your Firebase keys private.*

---

## 🚀 Interview Talking Points

### 1. The Core Value Proposition
* **Problem**: Campuses often lack a centralized digital hub for lost and found, relying on fragmented social media groups or physical offices.
* **Solution**: A dedicated platform that categorizes items, provides visual proof via photo uploads, and offers a secure messaging relay.

### 2. Technical Stack & Architecture
* **Frontend**: Next.js 15 (App Router).
* **UI/UX**: Tailwind CSS and ShadCN UI.
* **Backend**: Firebase Storage for images and Firestore (simulated via JSON DB for this version) for data.
* **Type Safety**: Full TypeScript integration with Zod validation.

### 3. Key Implementation Details
* **Secure Image Workflow**: Implemented a sophisticated upload flow that handles file validation (JPG/PNG), provides real-time progress indicators, and includes cleanup logic.
* **Responsive Design**: Mobile-first approach with custom responsive navigation.

### 4. Challenges Overcome
* **Configuration Resilience**: Developed a robust check system for Firebase environment variables to ensure the app fails gracefully if credentials are missing.
* **Asynchronous UX**: Managed the complexity of ensuring a photo upload completes before the final database entry is created.
