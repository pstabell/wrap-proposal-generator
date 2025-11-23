# Quick Start Guide

Get the WRAP Proposal Generator running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Google Chrome installed (for local development)
- Git installed

## Local Development (3 Steps)

### 1. Install Dependencies

```bash
cd "C:\Users\Patri\Metro Point Insurance\Metro Point Technology - Documents\Websites\wrap-proposal-generator"
npm install
```

Wait for installation to complete (~2 minutes).

### 2. Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
```

### 3. Open in Browser

Go to [http://localhost:3000](http://localhost:3000)

You should see the WRAP Proposal Generator form!

## Test PDF Generation

1. Fill out the form with test data:
   - **Agent Name**: John Smith
   - **Client Name**: Jane Doe
   - **Address**: 123 Main St
   - **City**: Naples
   - **State**: FL
   - **ZIP**: 34102

2. Check at least one coverage type (e.g., "Homeowners Insurance")

3. Fill out the coverage fields that appear

4. Click "Generate Proposal PDF"

5. PDF should download automatically!

## Deploy to Vercel (3 Steps)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect to Vercel

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository

### 3. Deploy

- Click "Deploy"
- Wait ~2 minutes
- Your app is live! 🎉

## Troubleshooting

### "Module not found" Error

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 Already in Use

```bash
npm run dev -- -p 3001
```

Then go to http://localhost:3001

### PDF Generation Fails Locally

Make sure Google Chrome is installed at:
- Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`

### Build Fails

```bash
npm run build
```

Fix any TypeScript errors shown.

## What's Next?

- Read [README.md](README.md) for full documentation
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment details
- Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details

## Need Help?

Contact Metro Point Technology support.

---

**That's it! You're ready to generate professional insurance proposals.**
