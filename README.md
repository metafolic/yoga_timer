# ZenClock by YogaClock.com 🧘‍♀️

A free, customizable online yoga timer specifically designed for Yin Yoga practice. Available at [YogaClock.com](https://yogaclock.com).

## 🌟 Features

- Adjustable number of poses (1-100)
- Customizable hold times for deep stretching
- Transition periods between poses
- Clean, minimalist interface
- No registration required

## 🚀 Try it Live

Visit: [https://yogaclock.com](https://yogaclock.com)

## 🧘 About Yin Yoga

Yin Yoga is a slow-paced practice where poses are held for longer periods (typically 3-5 minutes) to target deep connective tissues and promote mindfulness.

## 📱 Mobile Friendly

ZenClock works perfectly on all devices - desktop, tablet, and mobile.

## 🔗 Keywords

yoga timer, yoga clock, yin yoga, meditation timer, interval timer, yoga practice, mindfulness, zenclock, yogaclock

---

## 🛠️ How to Update and Deploy YogaClock.com

### 1. Quick S3-Only Deployment

If you only need to update the static site files (HTML, CSS, JS, images):

1. Open PowerShell in the project directory.
2. Run:
   ```powershell
   .\deploy-s3-simple.ps1
   ```
3. Your changes will be live on the S3 website endpoint within seconds:
   - http://yogaclock-com-static.s3-website-us-east-1.amazonaws.com
4. If you use CloudFront (custom domain), see below to update the cache.

### 2. Full AWS Deployment (S3 + CloudFront)

To update both S3 and CloudFront (for your custom domain):

1. Open PowerShell in the project directory.
2. Run:
   ```powershell
   .\deploy-cloudfront-simple.ps1
   ```
   This will:
   - Upload your site to S3
   - Invalidate the CloudFront cache so changes appear on your custom domain

### 3. Manually Invalidate CloudFront Cache

If you update S3 but don't see changes on your custom domain, you may need to invalidate CloudFront:

1. Find your CloudFront Distribution ID (in AWS Console, looks like `E123ABC456XYZ`).
2. Run:
   ```powershell
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```
   Replace `YOUR_DIST_ID` with your actual distribution ID.
3. Changes will appear on your custom domain within 1–5 minutes.

### 4. Troubleshooting

- **S3 endpoint updates but custom domain does not:** Run a CloudFront invalidation as above.
- **Still not updating?** Try a hard refresh (Ctrl+F5) or clear your browser cache.
- **AWS CLI errors:** Make sure AWS CLI is installed and configured (`aws configure`).
- **Check S3 bucket policy:** Ensure the bucket allows public read access (see `aws-config/s3-bucket-policy.json`).

### 5. Useful Endpoints

- **S3 Website:** http://yogaclock-com-static.s3-website-us-east-1.amazonaws.com
- **CloudFront Domain:** https://[your-cloudfront-domain].cloudfront.net
- **Custom Domain:** https://yogaclock.com

---

For more details, see the deployment scripts in this repo or contact the site maintainer.
