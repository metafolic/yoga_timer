# 🚀 AWS S3 + CloudFront Deployment Guide for YogaClock.com

This guide will help you migrate your yoga timer app from Netlify to AWS S3 + CloudFront.

## 📋 Prerequisites

1. **AWS Account** - Sign up at [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI** - Download and install from [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3. **Domain Access** - Ability to update DNS records at your current DNS provider for `yogaclock.com`

## ⚙️ Initial Setup

### 1. Configure AWS CLI

```powershell
# Configure AWS credentials
aws configure

# Enter your:
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region: us-east-1
# Default output format: json
```

### 2. Verify AWS Setup

```powershell
# Test AWS connection
aws sts get-caller-identity
```

## 🚀 Deployment Steps

### Option A: Automated Deployment (Recommended)

Run the master deployment script:

```powershell
# Navigate to your project directory
cd c:\Users\aliec\repos\yoga_timer

# Run the complete deployment
.\deploy-complete.ps1
```

### Option B: Step-by-Step Deployment

If you prefer manual control, run each script individually:

#### Step 1: Deploy to S3

```powershell
.\deploy-s3.ps1
```

**What this does:**

- Creates S3 bucket `yogaclock-com-static`
- Configures bucket for static website hosting
- Uploads all your website files
- Sets proper cache headers for optimal performance
- Provides S3 website endpoint for testing

#### Step 2: Set Up CloudFront + SSL

```powershell
.\deploy-cloudfront.ps1
```

**What this does:**

- Requests SSL certificate via AWS Certificate Manager
- Creates CloudFront distribution with proper caching rules
- Applies security headers (matching your Netlify setup)
- Configures custom domain support

**⚠️ Important:** You'll need to validate the SSL certificate by adding DNS records to your domain.

#### Step 3: Configure Redirects (Optional)

```powershell
# Replace DISTRIBUTION_ID with your CloudFront distribution ID
.\setup-redirects.ps1 -DistributionId "EXXXXXXXXXXXXX"
```

#### Step 4: Configure DNS at Your Domain Provider

```powershell
# Get DNS configuration instructions
.\setup-dns.ps1 -CloudFrontDomain "dxxxxxxxxxxxxx.cloudfront.net"
```

**⚠️ Important:** Update DNS records at your existing domain provider (where you manage yogaclock.com DNS).

## 🔧 Configuration Files Explained

### AWS Configuration Files (`aws-config/` folder)

- **`s3-bucket-policy.json`** - Allows public read access to your website files
- **`s3-website-config.json`** - Configures S3 for static website hosting with redirects
- **`cloudfront-distribution-config.json`** - CloudFront settings with caching rules
- **`cloudfront-response-headers-policy.json`** - Security headers (X-Frame-Options, etc.)
- **`cloudfront-redirect-function.js`** - Handles www to non-www redirects

### Deployment Scripts

- **`deploy-s3.ps1`** - S3 bucket creation and file upload
- **`deploy-cloudfront.ps1`** - CloudFront distribution and SSL setup
- **`setup-redirects.ps1`** - CloudFront function for redirects
- **`setup-dns.ps1`** - DNS configuration instructions for your existing DNS provider
- **`deploy-complete.ps1`** - Orchestrates the entire deployment

## 🌐 Migration Checklist

### Before Migration

- [ ] AWS account created and CLI configured
- [ ] Domain registrar access confirmed
- [ ] Current website backed up

### During Migration

- [ ] S3 bucket created and files uploaded
- [ ] SSL certificate requested and validated
- [ ] CloudFront distribution created
- [ ] DNS records configured
- [ ] Domain name servers updated

### After Migration

- [ ] Website accessible via CloudFront URL
- [ ] Custom domain working (may take up to 48 hours)
- [ ] Redirects working (www → non-www)
- [ ] SSL certificate valid
- [ ] Cache headers properly set

## 🧪 Testing Your Deployment

### 1. Test S3 Website (After Step 1)

```
http://yogaclock-com-static.s3-website-us-east-1.amazonaws.com
```

### 2. Test CloudFront Distribution (After Step 2)

```
https://dxxxxxxxxxxxxx.cloudfront.net
```

### 3. Test Custom Domain (After Step 4)

```
https://yogaclock.com
https://www.yogaclock.com (should redirect to main domain)
```

## 💰 Cost Estimate

- **S3 Storage**: ~$0.50-2/month
- **CloudFront**: ~$1-5/month (depending on traffic)
- **Total**: ~$1.50-7/month (since you're keeping your existing DNS provider)

## 🔄 Updating Your Website

After initial deployment, update your website by running:

```powershell
.\deploy-s3.ps1  # This will sync new files and invalidate CloudFront cache
```

## 🆘 Troubleshooting

### Common Issues

1. **"AccessDenied" errors**

   - Check AWS credentials and permissions
   - Ensure S3 bucket policy is applied

2. **SSL certificate validation fails**

   - Verify DNS records are added correctly
   - Wait up to 30 minutes for validation

3. **Website not accessible via custom domain**

   - Check name servers at domain registrar
   - DNS propagation can take up to 48 hours

4. **CloudFront not serving updated content**
   - Run cache invalidation: `aws cloudfront create-invalidation --distribution-id EXXXXXXXXXXXXX --paths "/*"`

### Support Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Route 53 Documentation](https://docs.aws.amazon.com/route53/)

## 🎉 Migration Complete!

Once everything is working:

1. Update any external links to point to your new AWS-hosted site
2. Consider setting up monitoring with AWS CloudWatch
3. Remove your Netlify site when you're confident everything is working
4. Celebrate your successful migration! 🎊

---

**Need help?** Check the AWS documentation or reach out for support.
