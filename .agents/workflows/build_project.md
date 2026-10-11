# Build Project Workflow

## Prerequisites
- **Node.js** >= v20.x.x (verified with `node --version`)
- Project directory: The root folder containing `package.json` and `next.config.ts`

## Steps

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```
> **Note**: The `--legacy-peer-deps` flag is required due to a peer dependency conflict between `firebase@^10.12.2` and `@tanstack-query-firebase/react` which requires `firebase@^11.3.0`.

### 2. Typecheck (Optional)
```bash
node ./node_modules/typescript/bin/tsc --noEmit
```
> **Note**: `tsc` is not globally installed. Use the local TypeScript binary from `node_modules`. There are known type warnings related to Next.js module declarations that do not affect the build.

### 3. Build for Production
```bash
npm run build
```
This compiles the Next.js 15 application with Turbopack. Expected output:
- `✓ Compiled successfully`
- `✓ Generating static pages (7/7)`

### Routes
| Route | Type |
|---|---|
| `/` | Static |
| `/items/[id]` | SSG |
| `/post-item` | Static |
| `/search-items` | Dynamic |

## Environment Variables
Ensure `.env.local` exists in the project root with the following Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=<your_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_auth_domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your_project_id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your_storage_bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your_messaging_sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your_app_id>
```
