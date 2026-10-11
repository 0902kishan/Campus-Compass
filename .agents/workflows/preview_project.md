# Preview Project Workflow

## Prerequisites
- Dependencies installed (see `build_project.md`)
- `.env.local` configured with Firebase credentials

## Steps

### 1. Start Development Server
```bash
npm run dev
```
This runs `next dev --turbopack -p 9002`, starting the Next.js development server with Turbopack on port **9002**.

### 2. Access the Application
Open your browser and navigate to:
- **Local**: http://localhost:9002
- **Network**: http://<your-ip>:9002

### 3. Verify
- The home page should display the Campus Compass lost-and-found platform
- Navigation bar should show: **Home**, **Search Items**, **Post Found Item**
- All routes should be accessible:
  - `/` — Landing page with recent items
  - `/search-items` — Search and browse found items
  - `/post-item` — Form to report a found item
  - `/items/[id]` — Individual item detail page

### 4. Stop the Server
Press `Ctrl+C` in the terminal to stop the dev server.

## Troubleshooting
- If port 9002 is in use, the dev script is hardcoded to port 9002 in `package.json`. Change it there if needed.
- If the app shows blank content, verify `.env.local` has correct Firebase credentials.
