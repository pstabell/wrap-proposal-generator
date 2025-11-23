# PDF Generation Setup

This application uses **PDFShift API** for generating PDFs in Vercel's serverless environment.

## Why PDFShift?

After extensive testing with various solutions (Puppeteer, Chromium, Playwright, React PDF), PDFShift proved to be the most reliable solution for Vercel serverless because:

- ✅ No browser binaries needed (works in serverless)
- ✅ Handles complex HTML/CSS perfectly
- ✅ Fast and reliable
- ✅ Generates professional 18-page proposals
- ✅ Simple HTTP API

## Setup Instructions

### 1. Get PDFShift API Key

1. Go to https://pdfshift.io/
2. Sign up for an account
3. Get your API key from the dashboard
4. **Free tier**: 50 conversions/month (perfect for testing)
5. **Paid plans**: Start at $9/month for 250 conversions

### 2. Add Environment Variable

#### For Local Development:
Create a `.env.local` file in the project root:
```
PDFSHIFT_API_KEY=your_api_key_here
```

#### For Vercel Production:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add: `PDFSHIFT_API_KEY` = `your_api_key_here`
5. Redeploy your application

### 3. Test

Generate a proposal with full sample data - you should get a complete 18-page PDF with:
- Professional cover page
- Table of contents  
- Welcome & disclaimers
- About agency
- Team page
- Detailed coverage pages for each line
- Premium summary with savings
- Recommendations

## Alternative Solutions (if needed)

If you prefer not to use PDFShift, other reliable API services include:

1. **DocRaptor** - https://docraptor.com/ ($15/month)
2. **PDF.co** - https://pdf.co/ ($99/month)
3. **CloudConvert** - https://cloudconvert.com/ (pay as you go)

All of these work similarly - just replace the API endpoint and authentication in `app/api/generate-pdf/route.ts`.

## Cost Estimate

For typical usage (assuming 100-200 proposals per month):
- **Free Tier**: 50/month = $0
- **Starter Plan**: 250/month = $9/month
- **Business Plan**: 1000/month = $29/month

Much more cost-effective than running dedicated browser instances!
