# PowerShell script to create CloudFront function for redirects

param(
    [Parameter(Mandatory=$true)]
    [string]$DistributionId
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Creating CloudFront function for redirects..." -ForegroundColor Green

# Step 1: Create CloudFront Function
Write-Host "📝 Step 1: Creating CloudFront function..." -ForegroundColor Yellow

$functionCode = Get-Content "aws-config/cloudfront-redirect-function.js" -Raw

try {
    $functionResult = aws cloudfront create-function `
        --name "YogaClock-Redirects" `
        --function-config "Comment=Handle redirects for YogaClock.com,Runtime=cloudfront-js-1.0" `
        --function-code $functionCode

    $function = $functionResult | ConvertFrom-Json
    $functionArn = $function.FunctionSummary.Name
    
    Write-Host "✅ CloudFront function created: $functionArn" -ForegroundColor Green
    
    # Publish the function
    Write-Host "📦 Step 2: Publishing function..." -ForegroundColor Yellow
    
    $publishResult = aws cloudfront publish-function --name "YogaClock-Redirects" --if-match $function.ETag
    $publishedFunction = $publishResult | ConvertFrom-Json
    
    Write-Host "✅ Function published successfully" -ForegroundColor Green
    
    # Step 3: Associate function with distribution
    Write-Host "🔗 Step 3: Associating function with distribution..." -ForegroundColor Yellow
    
    # Get current distribution config
    $distConfig = aws cloudfront get-distribution-config --id $DistributionId
    $config = $distConfig | ConvertFrom-Json
    
    # Add function association to default cache behavior
    $config.DistributionConfig.DefaultCacheBehavior.FunctionAssociations = @{
        Quantity = 1
        Items = @(
            @{
                FunctionARN = $publishedFunction.FunctionSummary.FunctionARN
                EventType = "viewer-request"
            }
        )
    }
    
    # Update distribution
    $updateResult = aws cloudfront update-distribution `
        --id $DistributionId `
        --distribution-config ($config.DistributionConfig | ConvertTo-Json -Depth 10) `
        --if-match $config.ETag
    
    Write-Host "✅ Function associated with distribution" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to create or associate CloudFront function" -ForegroundColor Red
    Write-Host "You may need to create the redirects manually in the AWS console" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Redirect function setup completed!" -ForegroundColor Green