Write-Host "Deploying updated site to S3 and invalidating CloudFront cache..." -ForegroundColor Green

# Upload site to S3
aws s3 sync . s3://yogaclock-com-static --delete --exclude ".git/*" --exclude "aws-config/*" --exclude "*.ps1"

# Invalidate CloudFront cache
$distributionId = "E1NLCM3ZJ8Y6PP"
aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*"

Write-Host "Deployment complete! Your site will update on CloudFront within a few minutes." -ForegroundColor Green