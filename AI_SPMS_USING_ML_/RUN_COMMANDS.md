# Run Program Commands

## Prerequisites
Make sure you have Node.js installed (v16 or higher).

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Fix Permissions (if needed)
If you encounter permission errors, run:
```bash
chmod +x node_modules/.bin/*
```

## Running the Application

### Option 1: Using npm (Recommended)
```bash
npm run dev
```

### Option 2: Direct Node Command (If npm fails)
```bash
/usr/local/bin/node node_modules/vite/bin/vite.js
```

### Option 3: Using npx
```bash
npx vite
```

## Access the Application

After running the dev server, open your browser and navigate to:
- **Local**: http://localhost:5173
- **Network**: The terminal will show the network URL (e.g., http://192.168.x.x:5173)

## Other Useful Commands

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Linter
```bash
npm run lint
```

### Run Backend Server (if needed)
```bash
npm run server
```

## Login Credentials

### Admin Login
- **Email**: admin@example.com
- **Password**: admin123

### Student Access
- Select "Student" role on login page
- Choose a student from the dropdown (students need to be added first)
- Click "Access Student Dashboard"

## Adding Sample Students

1. Login as Admin
2. Navigate to "Student Management"
3. Click "Add Sample Students (15)" button (if no students exist)
4. Wait for confirmation message
5. Students will now appear in the login dropdown

## Troubleshooting

### Port Already in Use
If port 5173 is already in use:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Permission Denied Error
```bash
chmod +x node_modules/.bin/*
npm run dev
```

### Firebase Connection Issues
- Check Firebase configuration in `src/config/firebase.ts`
- Verify Firebase project is active in Firebase Console
- Check internet connection

### Clear Cache and Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Development Server Features

- **Hot Module Replacement (HMR)**: Changes reflect immediately
- **Fast Refresh**: React components update without losing state
- **TypeScript**: Full TypeScript support with type checking
- **ESLint**: Code linting for better code quality

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.


