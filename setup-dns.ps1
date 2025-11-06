# DNS Configuration Guide for YogaClock.com
# This script provides instructions for updating your existing DNS provider

param(
    [Parameter(Mandatory=$true)]
    [string]$CloudFrontDomain
)

Write-Host "🌐 DNS Configuration Guide for YogaClock.com" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Write-Host "You need to update DNS records at your current DNS provider" -ForegroundColor Yellow
Write-Host "(where you registered yogaclock.com or manage its DNS)" -ForegroundColor Blue
Write-Host ""

Write-Host "📋 DNS Records to Update:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣ Main Domain (yogaclock.com):" -ForegroundColor Yellow
Write-Host "   Record Type: CNAME or ALIAS" -ForegroundColor White
Write-Host "   Name/Host: @ (or leave blank for root domain)" -ForegroundColor White
Write-Host "   Value/Target: $CloudFrontDomain" -ForegroundColor Green
Write-Host "   TTL: 300 (5 minutes)" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣ WWW Subdomain (www.yogaclock.com):" -ForegroundColor Yellow
Write-Host "   Record Type: CNAME" -ForegroundColor White
Write-Host "   Name/Host: www" -ForegroundColor White
Write-Host "   Value/Target: $CloudFrontDomain" -ForegroundColor Green
Write-Host "   TTL: 300 (5 minutes)" -ForegroundColor White
Write-Host ""

Write-Host "🎯 For Namecheap (your DNS provider):" -ForegroundColor Blue
Write-Host "   1. Log into your Namecheap account" -ForegroundColor White
Write-Host "   2. Go to Domain List → Manage (next to yogaclock.com)" -ForegroundColor White
Write-Host "   3. Click on 'Advanced DNS' tab" -ForegroundColor White
Write-Host "   4. Delete any existing A Records or CNAME Records for '@' and 'www'" -ForegroundColor Yellow
Write-Host "   5. Add the new records shown above" -ForegroundColor White
Write-Host ""

Write-Host "⚠️ Important Notes:" -ForegroundColor Red
Write-Host "   • Delete any existing A records for yogaclock.com and www.yogaclock.com" -ForegroundColor White
Write-Host "   • Some providers use ALIAS instead of CNAME for root domains" -ForegroundColor White
Write-Host "   • Changes can take 5 minutes to 24 hours to propagate" -ForegroundColor White
Write-Host ""

Write-Host "🧪 Test Your Configuration:" -ForegroundColor Green
Write-Host "   1. Wait 10-15 minutes after making changes" -ForegroundColor White
Write-Host "   2. Test: https://yogaclock.com" -ForegroundColor Cyan
Write-Host "   3. Test: https://www.yogaclock.com (should redirect)" -ForegroundColor Cyan
Write-Host "   4. Use online tools like 'whatsmydns.net' to check propagation" -ForegroundColor White
Write-Host ""

Write-Host "✅ That's it! No Route 53 needed." -ForegroundColor Green
Write-Host ""

# Save this information to a file for reference
$dnsInstructions = @"
DNS Configuration for YogaClock.com
==================================

CloudFront Distribution: $CloudFrontDomain

DNS Records to Create:

1. Main Domain (yogaclock.com):
   Type: CNAME or ALIAS
   Name: @ (or blank)
   Value: $CloudFrontDomain
   TTL: 300

2. WWW Subdomain (www.yogaclock.com):
   Type: CNAME  
   Name: www
   Value: $CloudFrontDomain
   TTL: 300

Testing:
- https://yogaclock.com
- https://www.yogaclock.com

Generated: $(Get-Date)
"@

$dnsInstructions | Out-File "DNS-CONFIGURATION-INSTRUCTIONS.txt" -Encoding UTF8
Write-Host "📄 Instructions saved to: DNS-CONFIGURATION-INSTRUCTIONS.txt" -ForegroundColor Blue