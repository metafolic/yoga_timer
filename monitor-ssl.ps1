# SSL Certificate Validation Monitor
# Run this to check validation status every few minutes

Write-Host "Monitoring SSL Certificate Validation..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""

$certArn = "arn:aws:acm:us-east-1:874382053353:certificate/78b74e62-e7ea-419a-8e21-bcac4d5cfb7b"

while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    try {
        # Check overall certificate status
        $status = aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[0].Status" --output text
        
        Write-Host "[$timestamp] Certificate Status: $status" -ForegroundColor Cyan
        
        if ($status -eq "ISSUED") {
            Write-Host "" 
            Write-Host "🎉 SUCCESS! Certificate is now ISSUED!" -ForegroundColor Green
            Write-Host "You can now proceed with setting up the custom domain." -ForegroundColor Green
            break
        }
        
        # Check individual domain validation status
        $domainStatus = aws acm describe-certificate --certificate-arn $certArn --region us-east-1 --query "Certificate.DomainValidationOptions[*].[DomainName,ValidationStatus]" --output text
        Write-Host "[$timestamp] Domain details:" -ForegroundColor White
        Write-Host $domainStatus -ForegroundColor Gray
        
    } catch {
        Write-Host "[$timestamp] Error checking status" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Seconds 120  # Check every 2 minutes
}

Write-Host ""
Write-Host "Certificate validation complete! Ready for next steps." -ForegroundColor Green