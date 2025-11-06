# AWS Migration Checklist for YogaClock.com

## ✅ Installation & Setup

- [ ] Download AWS CLI from: https://awscli.amazonaws.com/AWSCLIV2.msi
- [ ] Install AWS CLI (run the .msi file)
- [ ] Restart PowerShell
- [ ] Test installation: `aws --version`
- [ ] Create AWS account at: https://aws.amazon.com (if needed)
- [ ] Configure AWS CLI: `aws configure`

## 🔑 AWS Credentials Setup

- [ ] Log into AWS Console
- [ ] Go to: IAM → Users → [Your username] → Security credentials
- [ ] Create access key → Command Line Interface (CLI)
- [ ] Copy Access Key ID and Secret Access Key
- [ ] Run `aws configure` and enter:
  - AWS Access Key ID: [your key]
  - AWS Secret Access Key: [your secret]
  - Default region: us-east-1
  - Output format: json

## 🚀 Deployment Steps

- [ ] Run: `.\deploy-complete.ps1`
- [ ] Follow the prompts for S3 setup
- [ ] Follow the prompts for CloudFront setup
- [ ] Get DNS instructions
- [ ] Update Namecheap DNS records

## 🌐 Namecheap DNS Update

- [ ] Log into Namecheap account
- [ ] Go to Domain List → Manage (yogaclock.com)
- [ ] Click "Advanced DNS" tab
- [ ] Delete existing A/CNAME records for @ and www
- [ ] Add new CNAME records (values provided by script)

## 🧪 Testing

- [ ] Test CloudFront URL: https://[distribution-domain].cloudfront.net
- [ ] Wait for DNS propagation (10-30 minutes)
- [ ] Test custom domain: https://yogaclock.com
- [ ] Test www redirect: https://www.yogaclock.com
- [ ] Remove Netlify site when confirmed working

Generated: November 4, 2025
