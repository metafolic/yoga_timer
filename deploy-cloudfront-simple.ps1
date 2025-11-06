# Simple CloudFront setup for YogaClock.com
Write-Host "Setting up CloudFront distribution..." -ForegroundColor Green

# Step 1: Request SSL Certificate
Write-Host "Requesting SSL certificate..." -ForegroundColor Yellow

$certArn = aws acm request-certificate --domain-name "yogaclock.com" --subject-alternative-names "www.yogaclock.com" --validation-method DNS --region us-east-1 --query 'CertificateArn' --output text

Write-Host "SSL certificate requested: $certArn" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: You need to validate this certificate!" -ForegroundColor Red
Write-Host "1. Go to AWS Certificate Manager in the us-east-1 region" -ForegroundColor Yellow
Write-Host "2. Find your certificate and add the DNS validation records" -ForegroundColor Yellow
Write-Host "3. Come back here when validation is complete" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter when you have completed DNS validation..."

Write-Host "Creating CloudFront distribution..." -ForegroundColor Yellow
Write-Host "This will take several minutes..." -ForegroundColor Blue

# Create a simple CloudFront distribution
$distributionConfig = @"
{
  "CallerReference": "yogaclock-$(Get-Date -Format 'yyyyMMddHHmmss')",
  "Comment": "YogaClock.com CDN",
  "DefaultCacheBehavior": {
    "TargetOriginId": "yogaclock-s3-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    }
  },
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "yogaclock-s3-origin",
      "DomainName": "yogaclock-com-static.s3-website-us-east-1.amazonaws.com",
      "CustomOriginConfig": {
        "HTTPPort": 80,
        "HTTPSPort": 443,
        "OriginProtocolPolicy": "http-only"
      }
    }]
  },
  "Enabled": true,
  "Aliases": {
    "Quantity": 2,
    "Items": ["yogaclock.com", "www.yogaclock.com"]
  },
  "DefaultRootObject": "index.html",
  "ViewerCertificate": {
    "ACMCertificateArn": "$certArn",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
"@

$distributionConfig | Out-File -FilePath "cloudfront-config-temp.json" -Encoding UTF8

$result = aws cloudfront create-distribution --distribution-config file://cloudfront-config-temp.json
$distribution = $result | ConvertFrom-Json

Write-Host "CloudFront distribution created!" -ForegroundColor Green
Write-Host "Distribution ID: $($distribution.Distribution.Id)" -ForegroundColor Cyan
Write-Host "CloudFront Domain: $($distribution.Distribution.DomainName)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your CloudFront distribution is being deployed..." -ForegroundColor Yellow
Write-Host "This can take 15-20 minutes to complete." -ForegroundColor Blue
Write-Host ""
Write-Host "Next step: Update your DNS at Namecheap to point to:" -ForegroundColor Green
Write-Host $distribution.Distribution.DomainName -ForegroundColor Cyan

# Clean up temp file
Remove-Item "cloudfront-config-temp.json" -ErrorAction SilentlyContinue