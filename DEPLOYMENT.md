# Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Prepare Your Repository**
   ```bash
   # Initialize git if not already done
   git init

   # Add all files
   git add .

   # Commit
   git commit -m "Initial commit - WRAP Proposal Generator"

   # Push to GitHub
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # For production deployment
   vercel --prod

   # Follow the prompts
   ```

## Post-Deployment

### Verify Deployment

1. Visit your deployed URL
2. Fill out the form with test data
3. Generate a PDF to ensure everything works

### Monitor Function Performance

1. Go to Vercel Dashboard
2. Navigate to your project
3. Click "Functions" tab
4. Monitor the `/api/generate-pdf` function
   - Check execution time
   - Monitor memory usage
   - Review any errors

## Vercel Configuration Details

The `vercel.json` file contains important settings:

```json
{
  "functions": {
    "app/api/generate-pdf/route.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### Function Limits on Vercel Free Tier

- **Memory**: 1024 MB (maximum for free tier)
- **Duration**: 10 seconds (hobby), 60 seconds requires Pro plan
- **Invocations**: 100 GB-hours per month

**Important**: If you're on the free tier, consider reducing `maxDuration` to 10 seconds in `vercel.json`:

```json
{
  "functions": {
    "app/api/generate-pdf/route.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

Most PDFs should generate in under 10 seconds. If you need longer durations, upgrade to Vercel Pro.

## Troubleshooting Deployment Issues

### Build Fails

**Error**: `Module not found`
- **Solution**: Run `npm install` locally to ensure package.json is correct
- **Solution**: Delete `node_modules` and `.next`, then reinstall

**Error**: TypeScript errors
- **Solution**: Run `npm run build` locally to catch errors before deploying
- **Solution**: Fix type errors in your code

### Runtime Errors

**Error**: PDF generation timeout
- **Solution**: Reduce `maxDuration` or upgrade to Pro plan
- **Solution**: Optimize HTML template to render faster

**Error**: Out of memory
- **Solution**: Already using max memory (1024 MB) on free tier
- **Solution**: Simplify HTML/CSS to reduce memory usage
- **Solution**: Upgrade to Vercel Pro for more memory

**Error**: Chromium executable not found
- **Solution**: Ensure `@sparticuz/chromium` is in dependencies, not devDependencies
- **Solution**: Verify `puppeteer-core` version is compatible

### Function Logs

To view detailed logs:

1. Go to Vercel Dashboard
2. Select your project
3. Click "Functions" tab
4. Click on the `/api/generate-pdf` function
5. View real-time logs

Or use Vercel CLI:
```bash
vercel logs <deployment-url>
```

## Environment Variables

Currently, no environment variables are required. The app works out of the box.

If you need to add environment variables in the future:

1. Go to Vercel Dashboard
2. Navigate to your project
3. Go to Settings > Environment Variables
4. Add variables
5. Redeploy for changes to take effect

## Performance Optimization

### Tips for Faster PDF Generation

1. **Minimize CSS**: The inline CSS in `pdf-generator.ts` is already optimized
2. **Reduce Images**: Avoid embedding large images in proposals
3. **Simplify HTML**: Complex layouts take longer to render
4. **Cache**: Consider caching frequently generated proposals (advanced)

### Monitoring

Set up monitoring to track:
- Average PDF generation time
- Error rates
- Function invocations
- Memory usage

## Scaling Considerations

### Free Tier Limits

Vercel Free Tier includes:
- Unlimited deployments
- 100 GB-hours of function execution per month
- Bandwidth limits apply

**Estimate**:
- Average PDF generation: ~5 seconds
- At 1024 MB: ~0.0014 GB-hours per PDF
- Monthly limit: ~71,428 PDFs per month

### When to Upgrade to Pro

Consider upgrading if you need:
- More function execution time (60+ seconds)
- More memory (>1024 MB)
- More bandwidth
- Team collaboration features
- Custom domains with more flexibility

## Security Considerations

### Input Validation

The API route validates:
- Required fields are present
- At least one coverage type is selected

### Rate Limiting

Consider adding rate limiting if experiencing abuse:
- Use Vercel's built-in rate limiting
- Or add middleware for custom rate limiting

### Data Privacy

- PDFs are generated on-the-fly and not stored
- No data is persisted on the server
- Client data stays private

## Custom Domain Setup

1. Go to Vercel Dashboard
2. Navigate to your project
3. Go to Settings > Domains
4. Add your custom domain
5. Configure DNS records as instructed
6. Wait for DNS propagation

## Rollback Deployment

If something goes wrong:

1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find the last working deployment
4. Click "..." menu
5. Select "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

For application-specific issues:
- Contact Metro Point Technology

---

**Last Updated**: November 2025
