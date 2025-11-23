# WRAP Proposal Generator

A Next.js application for generating professional insurance proposals (WRAP - Wealth Risk Analysis & Protection). This application allows insurance agents to create beautifully formatted PDF proposals with multiple coverage types.

## Features

- **Professional PDF Generation**: Create multi-page PDF proposals with cover pages, executive summaries, and detailed coverage breakdowns
- **Multiple Coverage Types**: Support for 10 different insurance types:
  - Homeowners Insurance
  - Condo Insurance
  - Wind/Hurricane Coverage
  - Auto Insurance
  - Umbrella/Excess Liability
  - Watercraft Insurance
  - Jewelry & Valuables
  - Cyber Insurance
  - Fine Arts Insurance
  - Other Coverage
- **Dynamic Forms**: Coverage-specific forms appear when selected
- **Premium Calculations**: Automatic calculation of totals and savings
- **Metro Point Branding**: Professional design with Metro Point colors (Primary: #003B5C, Accent: #D4AF37)
- **Vercel Ready**: Optimized for deployment on Vercel's free tier

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: Puppeteer Core + Chromium
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wrap-proposal-generator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Local Development

For local development, the application will use your locally installed Chrome browser. Make sure Google Chrome is installed at one of these locations:

- **Windows**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **macOS**: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Linux**: `/usr/bin/google-chrome`

## Project Structure

```
wrap-proposal-generator/
├── app/
│   ├── api/
│   │   └── generate-pdf/
│   │       └── route.ts          # PDF generation API endpoint
│   ├── page.tsx                   # Main proposal form component
│   └── layout.tsx                 # Root layout
├── lib/
│   ├── coverage-templates.ts      # Coverage type definitions
│   └── pdf-generator.ts           # HTML template generator
├── types/
│   └── index.ts                   # TypeScript type definitions
├── public/                        # Static assets
├── vercel.json                    # Vercel configuration
└── package.json
```

## How It Works

1. **Form Input**: Users fill out agent info, client info, and select coverage types
2. **Dynamic Forms**: Forms for each selected coverage type appear dynamically
3. **Data Collection**: All form data is collected into a structured `ProposalData` object
4. **HTML Generation**: The `pdf-generator.ts` creates a professional HTML template with:
   - Cover page with client information
   - Executive summary with premium totals
   - Individual pages for each coverage type
5. **PDF Rendering**: Puppeteer renders the HTML to a high-quality PDF
6. **Download**: The PDF is automatically downloaded to the user's device

## Deployment to Vercel

### Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect Next.js and configure the build settings
6. Click "Deploy"

### Important Vercel Configuration

The `vercel.json` file configures:
- **Memory**: 1024 MB for the PDF generation function
- **Max Duration**: 60 seconds for PDF generation
- These settings ensure the function has enough resources to generate complex PDFs

## Configuration

### Vercel Function Settings

The PDF generation endpoint is configured for optimal performance:
- Memory: 1024 MB
- Max Duration: 60 seconds (for complex proposals)

### Chromium Configuration

The application uses `@sparticuz/chromium` which is optimized for serverless environments:
- Automatic executable path detection
- Optimized arguments for Vercel
- Headless mode enabled

## Dependencies

### Production Dependencies
- `next`: React framework
- `react` & `react-dom`: UI library
- `puppeteer-core`: Headless browser control
- `@sparticuz/chromium`: Chromium binary for serverless
- `pdf-lib`: PDF manipulation (if needed)

### Development Dependencies
- `typescript`: Type safety
- `tailwindcss`: Styling framework
- `eslint`: Code linting

## Coverage Templates

Each coverage type has a predefined template in `lib/coverage-templates.ts` with:
- Title and emoji
- Field definitions (text, textarea, number)
- Required field indicators
- Placeholder text

## API Endpoints

### POST /api/generate-pdf

Generates a PDF from proposal data.

**Request Body**:
```typescript
{
  proposalDate: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    email?: string;
    phone?: string;
  };
  agentInfo: {
    name: string;
    phone?: string;
    email?: string;
  };
  coverages: {
    [coverageType: string]: {
      current_premium: string;
      proposed_premium: string;
      proposed_carrier: string;
      [key: string]: string | number;
    };
  };
  executiveSummary?: string;
  notes?: string;
}
```

**Response**: PDF file download

## Troubleshooting

### PDF Generation Fails

- **Local Development**: Ensure Chrome is installed
- **Vercel**: Check function logs in Vercel Dashboard
- **Memory Issues**: Increase memory in `vercel.json` if needed

### Form Validation Errors

- Ensure all required fields (marked with *) are filled
- At least one coverage type must be selected
- Premium amounts should be numeric values

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npm run lint`

## License

Proprietary - Metro Point Technology

## Support

For support, contact Metro Point Technology.

---

Built with Next.js and deployed on Vercel.
