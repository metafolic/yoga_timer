# Simple S3 deployment for YogaClock.com
param(
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "yogaclock-com-static"
)

Write-Host "Starting S3 deployment for YogaClock.com..." -ForegroundColor Green

# Check AWS CLI
try {
    $awsVersion = aws --version
    Write-Host "AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "AWS credentials configured" -ForegroundColor Green
    } else {
        Write-Host "AWS credentials not configured. Run 'aws configure' first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "AWS credentials not configured. Run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host "Creating S3 bucket..." -ForegroundColor Yellow

# Create S3 bucket
aws s3 mb "s3://$BucketName" --region us-east-1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Bucket may already exist, continuing..." -ForegroundColor Blue
}

Write-Host "Configuring bucket for website hosting..." -ForegroundColor Yellow

# Configure bucket for static website hosting
aws s3api put-bucket-website --bucket $BucketName --website-configuration file://aws-config/s3-website-config.json

# Apply bucket policy
aws s3api put-bucket-policy --bucket $BucketName --policy file://aws-config/s3-bucket-policy.json

# Disable block public access
aws s3api delete-public-access-block --bucket $BucketName

Write-Host "Uploading website files..." -ForegroundColor Yellow

# Sync files to S3
aws s3 sync . "s3://$BucketName" --exclude "*.md" --exclude ".git/*" --exclude "netlify.toml" --exclude "_redirects" --exclude "aws-config/*" --exclude "*.ps1" --delete

Write-Host "S3 deployment completed!" -ForegroundColor Green
Write-Host "S3 website endpoint: http://$BucketName.s3-website-us-east-1.amazonaws.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Run .\deploy-cloudfront-simple.ps1" -ForegroundColor Blue