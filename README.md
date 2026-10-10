# Campus Compass - Lost & Found Platform

Campus Compass is a full-stack web application designed to help students reunite with lost belongings on campus. It provides a centralized, easy-to-use interface for reporting found items and searching for lost ones.

## 🚀 Interview Talking Points

### 1. The Core Value Proposition
* **Problem**: Campuses often lack a centralized digital hub for lost and found, relying on fragmented social media groups or physical offices.
* **Solution**: A dedicated platform that categorizes items, provides visual proof via photo uploads, and offers a secure messaging relay to protect user privacy.

### 2. Technical Stack & Architecture
* **Frontend**: Built with **Next.js 15 (App Router)** for optimized performance and SEO.
* **UI/UX**: Styled using **Tailwind CSS** and **ShadCN UI**, ensuring a modern, responsive, and accessible (Aria-compliant) interface.
* **State & Forms**: Leveraged **React Hook Form** with **Zod validation** for robust client-side and server-side data integrity.
* **Backend & Storage**:
    * **Firebase Storage**: For high-performance image hosting.
    * **Firestore**: (Planned/Mocked) for real-time item tracking.
    * **Server Actions**: Used for form submissions to reduce client-side boilerplate and improve security.

### 3. Key Implementation Details
* **Secure Image Workflow**: Implemented a sophisticated upload flow in `ItemForm.tsx` that handles file validation (type/size), provides real-time progress indicators, and includes cleanup logic to remove orphaned uploads if the form isn't completed.
* **Responsive Design**: Utilized a mobile-first approach with Tailwind's grid and flexbox systems, featuring a custom responsive Navbar with a slide-out mobile menu.
* **Dynamic Search**: Created a search interface that allows users to filter items by name, category, or location, utilizing Next.js `searchParams` for shareable search results.

### 4. Challenges Overcome
* **Configuration Resilience**: Developed a robust check system for Firebase environment variables to ensure the app fails gracefully and provides clear developer feedback if credentials (like the Storage Bucket) are missing.
* **Asynchronous UX**: Managed the complexity of ensuring a photo upload completes and returns a valid URL before the final database entry is created, providing a seamless "loading" experience for the user.

## 🛠️ Tech Stack
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: ShadCN UI (Radix UI)
- **Database/Storage**: Firebase
- **Validation**: Zod
