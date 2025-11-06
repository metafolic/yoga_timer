# PowerShell script to create CloudFront distribution and SSL certificate
# Run this AFTER deploy-s3.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$Domain = "yogaclock.com",
    
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "yogaclock-com-static",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

Write-Host "🌐 Setting up CloudFront and SSL for YogaClock.com..." -ForegroundColor Green
Write-Host ""

# Step 1: Request SSL Certificate
Write-Host "🔒 Step 1: Requesting SSL certificate..." -ForegroundColor Yellow
Write-Host "ℹ️ SSL certificates for CloudFront must be in us-east-1 region" -ForegroundColor Blue

try {
    $certArn = aws acm request-certificate `
        --domain-name $Domain `
        --subject-alternative-names "www.$Domain" `
        --validation-method DNS `
        --region us-east-1 `
        --query 'CertificateArn' `
        --output text

    Write-Host "✅ SSL certificate requested: $certArn" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "⚠️ IMPORTANT: You need to validate the SSL certificate!" -ForegroundColor Red
    Write-Host "1. Go to AWS Certificate Manager in us-east-1 region"
    Write-Host "2. Find your certificate: $certArn"
    Write-Host "3. Add the DNS validation records to your domain"
    Write-Host "4. Wait for validation (can take up to 30 minutes)"
    Write-Host ""
    
    $response = Read-Host "Have you completed DNS validation? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "❌ Please complete DNS validation first, then run this script again." -ForegroundColor Red
        Write-Host "💡 You can check validation status in AWS Certificate Manager console." -ForegroundColor Blue
        exit 1
    }
    
} catch {
    Write-Host "❌ Failed to request SSL certificate. Check your AWS permissions." -ForegroundColor Red
    exit 1
}

# Step 2: Create Response Headers Policy
Write-Host "🛡️ Step 2: Creating response headers policy..." -ForegroundColor Yellow

try {
    $headersPolicy = aws cloudfront create-response-headers-policy `
        --response-headers-policy-config file://aws-config/cloudfront-response-headers-policy.json `
        --query 'ResponseHeadersPolicy.Id' `
        --output text 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Response headers policy created: $headersPolicy" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Response headers policy may already exist" -ForegroundColor Blue
        # Try to find existing policy
        $headersPolicy = aws cloudfront list-response-headers-policies `
            --query 'ResponseHeadersPolicyList.Items[?ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name==`YogaClock-SecurityHeaders`].ResponseHeadersPolicy.Id' `
            --output text
    }
} catch {
    Write-Host "⚠️ Could not create response headers policy. Will proceed without it." -ForegroundColor Yellow
    $headersPolicy = $null
}

# Step 3: Update CloudFront config with certificate ARN
Write-Host "📝 Step 3: Preparing CloudFront configuration..." -ForegroundColor Yellow

$configContent = Get-Content "aws-config/cloudfront-distribution-config.json" -Raw | ConvertFrom-Json

# Update the S3 origin domain name
$configContent.Origins.Items[0].DomainName = "$BucketName.s3-website-$Region.amazonaws.com"

# Update certificate ARN
$configContent.ViewerCertificate = @{
    "ACMCertificateArn" = $certArn
    "SSLSupportMethod" = "sni-only"
    "MinimumProtocolVersion" = "TLSv1.2_2021"
    "CertificateSource" = "acm"
}

# Add response headers policy if created
if ($headersPolicy) {
    $configContent.DefaultCacheBehavior.ResponseHeadersPolicyId = $headersPolicy
    foreach ($behavior in $configContent.CacheBehaviors.Items) {
        $behavior.ResponseHeadersPolicyId = $headersPolicy
    }
}

# Save updated config
$configContent | ConvertTo-Json -Depth 10 | Out-File "aws-config/cloudfront-distribution-config-final.json" -Encoding UTF8

# Step 4: Create CloudFront Distribution
Write-Host "☁️ Step 4: Creating CloudFront distribution..." -ForegroundColor Yellow

try {
    $distributionResult = aws cloudfront create-distribution `
        --distribution-config file://aws-config/cloudfront-distribution-config-final.json

    $distribution = $distributionResult | ConvertFrom-Json
    $distributionId = $distribution.Distribution.Id
    $distributionDomain = $distribution.Distribution.DomainName

    Write-Host "✅ CloudFront distribution created!" -ForegroundColor Green
    Write-Host "   Distribution ID: $distributionId" -ForegroundColor Cyan
    Write-Host "   CloudFront Domain: $distributionDomain" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Failed to create CloudFront distribution." -ForegroundColor Red
    Write-Host "Check the configuration file and your AWS permissions." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "⏳ CloudFront distribution is being deployed..." -ForegroundColor Yellow
Write-Host "This can take 15-20 minutes to complete." -ForegroundColor Blue
Write-Host ""

# Step 5: Wait for deployment (optional)
$waitForDeployment = Read-Host "Would you like to wait for deployment to complete? (y/n)"

if ($waitForDeployment -eq 'y' -or $waitForDeployment -eq 'Y') {
    Write-Host "⏳ Waiting for CloudFront deployment..." -ForegroundColor Yellow
    aws cloudfront wait distribution-deployed --id $distributionId
    Write-Host "✅ CloudFront distribution deployed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 CloudFront setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Yellow
Write-Host "   SSL Certificate: $certArn"
Write-Host "   Distribution ID: $distributionId"
Write-Host "   CloudFront URL: https://$distributionDomain"
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Set up Route 53 DNS records (run './setup-dns.ps1')"
Write-Host "2. Test your website at: https://$distributionDomain"
Write-Host "3. Once DNS is configured, test: https://$Domain"
Write-Host ""
Write-Host "💡 Save this information for future reference!" -ForegroundColor Blue