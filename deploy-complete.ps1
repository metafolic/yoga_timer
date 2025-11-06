# Master deployment script for YogaClock.com migration to AWS
# This script orchestrates the entire deployment process

param(
    [Parameter(Mandatory=$false)]
    [string]$Domain = "yogaclock.com",
    
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "yogaclock-com-static",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipDNS = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🎯 YogaClock.com Migration to AWS S3 + CloudFront" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""

# Pre-flight checks
Write-Host "✈️ Running pre-flight checks..." -ForegroundColor Yellow

# Check AWS CLI
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    Write-Host "💡 Download from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" -ForegroundColor Blue
    exit 1
}

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity --query 'Arn' --output text
    Write-Host "✅ AWS Credentials: $identity" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS credentials not configured. Run 'aws configure' first." -ForegroundColor Red
    exit 1
}

# Check required files
$requiredFiles = @(
    "index.html",
    "styles.css", 
    "script.js",
    "404.html"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Missing: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🚀 Starting deployment process..." -ForegroundColor Green
Write-Host ""

# Step 1: Deploy to S3
Write-Host "📦 STEP 1: Deploying to S3..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

try {
    .\deploy-s3.ps1 -BucketName $BucketName -Region $Region
    Write-Host "✅ S3 deployment completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ S3 deployment failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Read-Host "Press Enter to continue to CloudFront setup..."

# Step 2: Set up CloudFront
Write-Host "☁️ STEP 2: Setting up CloudFront + SSL..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

try {
    $result = .\deploy-cloudfront.ps1 -Domain $Domain -BucketName $BucketName -Region $Region
    
    # Extract distribution info (this is a simplified approach)
    Write-Host "✅ CloudFront deployment completed!" -ForegroundColor Green
    
    # Prompt for distribution details
    Write-Host ""
    $distributionId = Read-Host "Enter your CloudFront Distribution ID (from the previous step)"
    $distributionDomain = Read-Host "Enter your CloudFront Domain Name (e.g., d123abc.cloudfront.net)"
    
} catch {
    Write-Host "❌ CloudFront deployment failed: $_" -ForegroundColor Red
    Write-Host "💡 You can continue manually using the AWS Console" -ForegroundColor Blue
    exit 1
}

Write-Host ""
Read-Host "Press Enter to continue to redirect setup..."

# Step 3: Set up redirects (optional)
Write-Host "🔄 STEP 3: Setting up redirects..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

$setupRedirects = Read-Host "Would you like to set up automatic redirects (www to non-www)? (y/n)"

if ($setupRedirects -eq 'y' -or $setupRedirects -eq 'Y') {
    try {
        .\setup-redirects.ps1 -DistributionId $distributionId
        Write-Host "✅ Redirects configured!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Redirect setup failed, but you can configure manually later" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️ Skipping redirect setup" -ForegroundColor Blue
}

# Step 4: DNS Configuration Instructions
if (-not $SkipDNS) {
    Write-Host ""
    Write-Host "🌐 STEP 4: DNS Configuration Instructions..." -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
    
    Write-Host "Now you need to update DNS records at your domain provider." -ForegroundColor Yellow
    Write-Host ""
    
    $showDNSInstructions = Read-Host "Would you like to see the DNS configuration instructions? (y/n)"
    
    if ($showDNSInstructions -eq 'y' -or $showDNSInstructions -eq 'Y') {
        try {
            .\setup-dns.ps1 -CloudFrontDomain $distributionDomain
            Write-Host "✅ DNS instructions generated!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Could not generate DNS instructions, but you can configure manually" -ForegroundColor Yellow
            Write-Host "Point yogaclock.com and www.yogaclock.com to: $distributionDomain" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⏭️ You can run '.\setup-dns.ps1 -CloudFrontDomain $distributionDomain' later for instructions" -ForegroundColor Blue
    }
}

# Final summary
Write-Host ""
Write-Host "🎉 MIGRATION COMPLETED! 🎉" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployment Summary:" -ForegroundColor Yellow
Write-Host "   S3 Bucket: $BucketName" -ForegroundColor Cyan
Write-Host "   CloudFront Distribution: $distributionId" -ForegroundColor Cyan
Write-Host "   CloudFront Domain: $distributionDomain" -ForegroundColor Cyan
Write-Host "   Custom Domain: $Domain" -ForegroundColor Cyan
Write-Host ""

if (-not $SkipDNS) {
    Write-Host "🔗 Test URLs:" -ForegroundColor Yellow
    Write-Host "   S3 Direct: http://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor Cyan
    Write-Host "   CloudFront: https://$distributionDomain" -ForegroundColor Cyan
    Write-Host "   Custom Domain: https://$Domain (after DNS propagates)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow

if (-not $SkipDNS) {
    Write-Host "   1. Update DNS records at your domain provider (see instructions above)" -ForegroundColor White
    Write-Host "   2. Point yogaclock.com and www.yogaclock.com to: $distributionDomain" -ForegroundColor White
    Write-Host "   3. Wait for DNS propagation (10 minutes to 24 hours)" -ForegroundColor White
    Write-Host "   4. Test your website at https://$Domain" -ForegroundColor White
    Write-Host "   5. Remove your Netlify site when everything works" -ForegroundColor White
} else {
    Write-Host "   1. Configure DNS manually to point to: $distributionDomain" -ForegroundColor White
    Write-Host "   2. Test your website" -ForegroundColor White
    Write-Host "   3. Remove your Netlify site when everything works" -ForegroundColor White
}

Write-Host ""
Write-Host "💡 To update your site in the future, just run: .\deploy-s3.ps1" -ForegroundColor Blue
Write-Host ""
Write-Host "Congratulations on successfully migrating to AWS!" -ForegroundColor Green