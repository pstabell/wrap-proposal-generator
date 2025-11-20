# 🚀 Quick Start Guide - WRAP Proposal Generator

## Fastest Way to See a Complete Proposal

### Option 1: Load Sample Data with One Click ⭐ RECOMMENDED

1. **Open** [index.html](index.html) in your browser
2. **Click** the **"🎯 Load Sample Data"** button in the toolbar
3. **Click "OK"** to confirm
4. **Done!** All fields are now filled with a complete high-net-worth client proposal

The sample data includes:
- ✅ Company: ABC Insurance Agency (3 team members)
- ✅ Client: Brian & Renee Dewolf
- ✅ 9 coverage types fully populated:
  - 🏠 Homeowners FL ($33,743.07 premium)
  - 🏢 Condo FL ($3,675.95 premium)
  - 🚗 Auto (4 vehicles, $6,621.00 premium)
  - ⛵ Watercraft ($2,419.00 premium)
  - 💎 Jewelry ($1,505.00 premium)
  - ☂️ Umbrella $10M ($2,009.00 premium)
  - 💨 Wind/Hurricane ($3,895.75 premium)
  - 🔒 Cyber Insurance ($2,675.00 premium)
  - 🎨 Fine Arts ($3,850.00 premium)
- ✅ Total Premium: $60,393.77 (all fields completed)

### Option 2: Manual Entry

1. Open [SAMPLE-DATA-FOR-TESTING.md](SAMPLE-DATA-FOR-TESTING.md)
2. Copy/paste data section by section
3. Fill out each coverage type

---

## After Loading Sample Data

### Preview Your Proposal
Click **"👁️ Preview PDF"** to see the complete ~16-page proposal including:
- **Professional cover page** with luxury lifestyle images (Kathleen Wiesenbaugh style)
  - Company logo/name in top left
  - Three beautiful poolside/luxury images
  - "PRIVATE CLIENT INSURANCE PROPOSAL" heading
  - Client name and producer details
- Table of contents
- Welcome & disclaimers
- About your agency
- Your team (3 members)
- Individual coverage pages (9 pages for all coverage types)
- Premium summary table with recommendations

### Generate PDF (Requires Desktop App)
Click **"📥 Generate PDF"** to create a downloadable PDF file.

*Note: Full PDF generation requires the Electron desktop app. In browser mode, use Preview.*

### Save Your Work
Click **"💾 Save Proposal"** to download as JSON for later loading.

---

## Creating Your Own Proposals

### Start Fresh
1. Click **"📄 New Proposal"**
2. Fill in your company branding
3. Add your team members (click "➕ Add Another Team Member")
4. Enter client information
5. Check the coverage boxes you need
6. Fill in each coverage section
7. Add executive summary and notes
8. Preview or generate PDF

---

## Tips for Best Results

### For Multi-Line Entries
Use the pipe character `|` to separate columns:

**Vehicles:**
```
2024 Maserati Grancabrio | VIN: ZAMBMXDB1RX446630 | Agreed Value: $244,497
2023 Cadillac Escalade | VIN: 1GYS4RKL7PR512086 | Agreed Value: $88,790
```

**Watercraft:**
```
2021 Chris Craft Launch 25 | Hull ID: CCBMG157G021 | Hull Value: $206,808
```

**Jewelry:**
```
Item 1: Platinum & diamond engagement ring, 4.15ct - Value: $176,165
```

### For Photos and Logos
- Upload images to your website
- Copy the full URL (e.g., `https://yoursite.com/logo.png`)
- Paste into the Logo URL or Photo URL fields
- Leave blank for placeholder initials

### For Brand Colors
- Click the color picker next to "Brand Color"
- Choose your agency color
- It will appear throughout the PDF (headers, borders, cover page)

**Recommended colors:**
- Navy Blue: `#003366` (default)
- Deep Blue: `#004080`
- Teal: `#006B5B`
- Burgundy: `#800020`

---

## Troubleshooting

**Q: The "Load Sample Data" button doesn't work**
- Make sure `sample-data.js` is in the same folder as `index.html`
- Check browser console for errors (F12)

**Q: PDF generation doesn't work**
- Browser mode only supports Preview
- For full PDF generation, use the Electron desktop app
- Run `npm install` then `npm start` from the FINAL-VERSION folder

**Q: My logo doesn't appear**
- Logo must be a public URL (https://)
- Cannot use local file paths (file:///)
- Try uploading to your website or use an image host

**Q: Premium totals don't update**
- Make sure you entered numbers in the Current Premium and Proposed Premium fields
- The summary auto-calculates when you enter premium amounts

---

## Next Steps

### Build the Desktop App
```powershell
cd FINAL-VERSION
npm install
npm start
```

### Create Standalone EXE
```powershell
npm run build-win
```

The `.exe` will be in the `dist` folder for distribution to other agents.

---

**Enjoy creating professional WRAP proposals!** 🎉

For detailed sample data, see [SAMPLE-DATA-FOR-TESTING.md](SAMPLE-DATA-FOR-TESTING.md)
For complete features, see [PHASE-2-COMPLETE.md](PHASE-2-COMPLETE.md)
