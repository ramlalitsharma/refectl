# 🚀 GOOGLE SEARCH CONSOLE SETUP & SUBMISSION GUIDE

**For**: refectl.com
**Status**: Ready for submission
**Date**: February 16, 2026

---

## Step-by-Step GSC Setup

### Step 1: Create/Access GSC Property

1. Go to: https://search.google.com/search-console
2. Sign in with your Google account
3. Click **"Add property"** (top left)
4. Enter: `https://www.refectl.com`
5. Choose: **"URL prefix"** property type
6. Click **"Continue"**

---

### Step 2: Verify Ownership (Choose One)

#### Option A: DNS Record (Recommended)

1. In GSC, copy the TXT record (looks like: `google-site-verification=xxxxx`)
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Add DNS TXT record:
   - Type: TXT
   - Name: @ (or your domain)
   - Value: Paste the verification code
4. Wait 5-15 minutes for DNS to propagate
5. Return to GSC and click "Verify"

#### Option B: HTML File Upload

1. Download the HTML file from GSC
2. Upload to: `public/google_verification.html`
3. Verify at: `https://www.refectl.com/google_verification.html`
4. Click "Verify" in GSC

#### Option C: Google Analytics (Fastest)

1. If you have GA4 property (G-RNZ9J7M4CD):
2. GSC will auto-detect the connection
3. Click "Verify" automatically

---

### Step 3: Submit Sitemap

1. In GSC, go to: **Sitemaps** (left sidebar)
2. Click **"Add a new sitemap"**
3. Enter: `sitemap.xml`
4. Click **"Submit"**
5. Wait for processing (usually instant)

---

### Step 4: Check ads.txt Detection

1. In GSC, go to: **Settings** → **Crawl stats**
2. Verify Google crawled: `www.refectl.com/ads.txt`
3. Should return HTTP 200 (success)

If not found:
- Ensure file is in `public/ads.txt`
- Deploy changes to production
- Wait 24 hours and recheck

---

### Step 5: Request Indexing

1. Go to: **URL Inspection** (top search box)
2. Type: `https://www.refectl.com`
3. Click **"Request indexing"**
4. Repeat for:
   - `https://www.refectl.com/shop/tools`
   - `https://www.refectl.com/courses`
   - `https://www.refectl.com/blog`
   - `https://www.refectl.com/news`

---

### Step 6: Monitor Reports

#### Coverage Report
- **What**: Index status of all pages
- **Location**: Coverage (left sidebar)
- **Expect**: 
  - ✅ Valid (all public pages)
  - ❌ Excluded (admin, auth pages)
- **Action**: Fix any errors

#### Performance Report
- **What**: Search appearance metrics
- **Location**: Performance (left sidebar)
- **Monitor**: 
  - Clicks from search
  - Impressions
  - Average CTR
  - Average position

#### URL Inspection
- **What**: Individual page status
- **Location**: URL Inspection (top)
- **Check**: Key pages are "Indexed"

#### Mobile Usability
- **What**: Mobile-friendliness issues
- **Location**: Mobile usability (left sidebar)
- **Expect**: ✅ No issues found

---

## Compliance Verification Checklist

### Before Submission
- [ ] All code changes committed
- [ ] Production deployment complete
- [ ] HTTPS/SSL certificate active
- [ ] Domain pointing to correct server
- [ ] robots.txt accessible at domain root
- [ ] ads.txt accessible and properly formatted
- [ ] sitemap.xml generating correctly
- [ ] GA4 tag installed (ID: G-RNZ9J7M4CD)
- [ ] Privacy policy page accessible
- [ ] Terms of service page accessible
- [ ] Contact page accessible

### GSC Setup
- [ ] Property created in GSC
- [ ] Site verified (via DNS/HTML/GA)
- [ ] Sitemap submitted
- [ ] robots.txt detected
- [ ] ads.txt detected
- [ ] Homepage indexed
- [ ] No "not indexed" errors

### AdSense Compliance
- [ ] Publisher ID: ca-pub-8149507764464883
- [ ] ads.txt with DIRECT and RESELLER
- [ ] Three ad slots active (5087174988, 9337411181, 5094089430)
- [ ] No invalid traffic
- [ ] No click fraud patterns
- [ ] Premium original content
- [ ] User-friendly ad placement

### Ongoing Monitoring
- [ ] Check GSC coverage weekly
- [ ] Monitor ad experience monthly
- [ ] Track Core Web Vitals
- [ ] Review mobile usability
- [ ] Watch for security issues
- [ ] Monitor crawl stats

---

## Expected Results Timeline

| Action | Timeline | Indicator |
|--------|----------|-----------|
| Property added to GSC | Immediate | Property shows in list |
| Site verification | 5-30 mins | Checkmark appears |
| Robots.txt detection | 1-24 hours | Shows in settings |
| Ads.txt detection | 1-24 hours | Status shows verified |
| Sitemap processing | 1-12 hours | Shows in Sitemaps report |
| Homepage indexed | 24-72 hours | Shows in Coverage (Valid) |
| Full site indexing | 1-2 weeks | All public pages indexed |
| Ad revenue starts | 3-7 days | Earnings show in AdSense |

---

## Troubleshooting Common Issues

### Issue: "Site not verified"
**Solution**:
1. Check DNS propagation (dns-checker.com)
2. Use HTML file upload as backup
3. Wait 30+ minutes and retry
4. Ensure domain DNS is correct

### Issue: "Sitemap can't be read"
**Solution**:
1. Verify sitemap.xml generates at domain root
2. Test in browser: `https://www.refectl.com/sitemap.xml`
3. Check robots.txt allows `/sitemap`
4. Ensure no login required

### Issue: "robots.txt not found"
**Solution**:
1. Create `public/robots.txt`
2. Deploy changes
3. Verify: `https://www.refectl.com/robots.txt`
4. Wait 24 hours

### Issue: "ads.txt invalid format"
**Solution**:
1. Use exact format:
   ```
   google.com, pub-8149507764464883, DIRECT, f08c47fec0942fa0
   ```
2. One entry per line
3. No extra spaces or characters
4. Proper line breaks (LF not CRLF)

### Issue: "Pages not indexed"
**Solution**:
1. Use URL Inspection tool
2. Click "Request indexing"
3. Check for robots.txt blocks
4. Verify page is public (not noindex)
5. Wait 1-2 weeks for crawl

### Issue: "Mobile usability errors"
**Solution**:
1. Test on mobile device
2. Use Chrome DevTools device mode
3. Check tap target sizes (48px)
4. Verify viewport meta tag
5. Test form inputs

---

## FAQs

**Q: How long until my pages appear in Google search?**
A: Usually 24-72 hours for initial crawl, 1-2 weeks for full indexing.

**Q: Will ads.txt file block ad serving?**
A: No, it only verifies your AdSense account.

**Q: Do I need to resubmit my sitemap?**
A: GSC auto-crawls it regularly. Submit once, then monitor.

**Q: When will I start earning money from ads?**
A: 3-7 days after GSC verification, once traffic appears.

**Q: What if Google detects violations?**
A: Review the specific warning in GSC → Security & Manual Actions, then fix.

**Q: How often does Google crawl my site?**
A: Frequency depends on update patterns and authority. Usually 1-3 times per week.

---

## Support & Resources

- **Google Search Console Help**: https://support.google.com/webmasters
- **AdSense Help**: https://support.google.com/adsense
- **robots.txt Tester**: https://www.google.com/webmasters/tools/robots-testing-tool
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **Core Web Vitals Guide**: https://web.dev/vitals/

---

## Your Site Details

- **Domain**: refectl.com
- **Primary URL**: https://www.refectl.com
- **AdSense Publisher ID**: ca-pub-8149507764464883
- **GA4 Property ID**: G-RNZ9J7M4CD
- **robots.txt**: https://www.refectl.com/robots.txt
- **ads.txt**: https://www.refectl.com/ads.txt
- **sitemap.xml**: https://www.refectl.com/sitemap.xml

---

**Status**: ✅ Ready for Production & GSC Submission
**Next Step**: Deploy and follow Step-by-Step GSC Setup above
