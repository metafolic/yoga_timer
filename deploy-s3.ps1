# PowerShell script to deploy YogaClock.com to AWS S3 + CloudFront
# Prerequisites: AWS CLI installed and configured with appropriate credentials

param(
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "yogaclock-com-static",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting deployment of YogaClock.com to AWS..." -ForegroundColor Green
Write-Host ""

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

# Check if AWS credentials are configured
try {
    $identity = aws sts get-caller-identity 2>$null
    if ($LASTEXITCODE -eq 0) {
        $identityObj = $identity | ConvertFrom-Json
        Write-Host "✅ AWS credentials configured for user: $($identityObj.Arn)" -ForegroundColor Green
    } else {
        throw "No credentials"
    }
} catch {
    Write-Host "❌ AWS credentials not configured. Run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Step 1: Creating S3 bucket..." -ForegroundColor Yellow

# Create S3 bucket
try {
    aws s3 mb "s3://$BucketName" --region $Region 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ S3 bucket created: $BucketName" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ S3 bucket already exists: $BucketName" -ForegroundColor Blue
    }
} catch {
    Write-Host "ℹ️ S3 bucket may already exist: $BucketName" -ForegroundColor Blue
}

Write-Host ""
Write-Host "⚙️ Step 2: Configuring S3 bucket for website hosting..." -ForegroundColor Yellow

# Configure bucket for static website hosting
aws s3api put-bucket-website --bucket $BucketName --website-configuration file://aws-config/s3-website-config.json
Write-Host "✅ S3 website configuration applied" -ForegroundColor Green

# Apply bucket policy
aws s3api put-bucket-policy --bucket $BucketName --policy file://aws-config/s3-bucket-policy.json
Write-Host "✅ S3 bucket policy applied" -ForegroundColor Green

# Disable block public access (required for website hosting)
aws s3api delete-public-access-block --bucket $BucketName
Write-Host "✅ Public access block removed" -ForegroundColor Green

Write-Host ""
Write-Host "📁 Step 3: Uploading website files..." -ForegroundColor Yellow

# Sync files to S3 (excluding unnecessary files)
$excludeParams = @(
    "--exclude", "*.md",
    "--exclude", ".git/*",
    "--exclude", "netlify.toml",
    "--exclude", "_redirects",
    "--exclude", "aws-config/*",
    "--exclude", "*.ps1"
)

aws s3 sync . "s3://$BucketName" @excludeParams --delete
Write-Host "✅ Website files uploaded to S3" -ForegroundColor Green

# Set proper content types and cache headers
Write-Host ""
Write-Host "🏷️ Step 4: Setting content types and cache headers..." -ForegroundColor Yellow

# Set cache headers for HTML files (no cache)
aws s3 cp "s3://$BucketName/" "s3://$BucketName/" --recursive --exclude "*" --include "*.html" --metadata-directive REPLACE --cache-control "public, max-age=0, must-revalidate"

# Set cache headers for CSS files (1 year cache)
aws s3 cp "s3://$BucketName/" "s3://$BucketName/" --recursive --exclude "*" --include "*.css" --metadata-directive REPLACE --cache-control "public, max-age=31536000"

# Set cache headers for JS files (1 year cache)
aws s3 cp "s3://$BucketName/" "s3://$BucketName/" --recursive --exclude "*" --include "*.js" --metadata-directive REPLACE --cache-control "public, max-age=31536000"

# Set cache headers for images (1 year cache)
aws s3 cp "s3://$BucketName/" "s3://$BucketName/" --recursive --exclude "*" --include "*.png" --include "*.jpg" --include "*.jpeg" --include "*.gif" --include "*.svg" --include "*.ico" --metadata-directive REPLACE --cache-control "public, max-age=31536000"

Write-Host "✅ Cache headers configured" -ForegroundColor Green

Write-Host ""
Write-Host "🌐 S3 website endpoint: http://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ S3 deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Create SSL certificate in AWS Certificate Manager"
Write-Host "2. Create CloudFront distribution"
Write-Host "3. Configure Route 53 DNS"
Write-Host "4. Test the deployment"
Write-Host ""
Write-Host "Run './deploy-cloudfront.ps1' to continue with CloudFront setup." -ForegroundColor Blue