# Reval - LLM Evaluation Platform

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, clone the repository then run the development server:

```bash
npm i
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Next.js app directory containing routes and page components
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and service modules
- `/src/models` - Data models and type definitions
- `/src/scripts` - Helper scripts for testing and debugging

## Debugging Tools

The project includes several debugging tools to help identify and fix issues with the leaderboard functionality:

### Console Logging

The application has extensive debug logging with descriptive prefixes:

- `🔍 DEBUG:` - Detailed debug information about data flow and application state
- `API route:` - Logs from API route handlers  

### Testing Scripts

Run these scripts to verify the application is working correctly:

```bash
# Test API endpoints for proper encoding and data structure
node src/scripts/test-api.js

# Validate leaderboard functionality end-to-end
node src/scripts/verify-leaderboard.js

# PowerShell script for testing API endpoints
.\src\scripts\test-api.ps1
```

### Health Check Endpoint

A dedicated health check endpoint is available at `/api/health` to verify API encoding is working correctly.

## Troubleshooting

### API Issues

If you encounter issues with the API routes:

1. Check that the backend server is running at `http://localhost:5000`
2. Verify API encoding with the health check endpoint
3. Look for detailed debug logs in the browser console and terminal

### React Key Warnings

The application has been updated to properly handle React key warnings in the leaderboard charts:

1. Keys have been removed from standalone components that don't need them
2. Keys are maintained on list items generated in loops  

### Infinite API Request Loop

The dependency array in `useCallback` hook has been fixed to prevent infinite API request loops.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
