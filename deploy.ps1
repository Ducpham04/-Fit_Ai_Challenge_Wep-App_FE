# Script deploy nhanh lên S3 và invalidate CloudFront
# Dùng cho deployment thủ công

$BucketName = "fit-ai-challenge-frontend"
$AppPath = "FIT_AI_Challenge_WEP\APP_FE"

Write-Host "=== Deploy Frontend to AWS ===" -ForegroundColor Cyan

# Build
Write-Host "`n📦 Building..." -ForegroundColor Yellow
Set-Location $AppPath
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed!" -ForegroundColor Green

# Deploy to S3
Write-Host "`n🚀 Deploying to S3..." -ForegroundColor Yellow
aws s3 sync dist/ s3://$BucketName --delete

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployed to S3!" -ForegroundColor Green

# Invalidate CloudFront cache (nếu có)
$CloudFrontInfoPath = "..\..\cloudfront-info.json"
if (Test-Path $CloudFrontInfoPath) {
    $CloudFrontInfo = Get-Content $CloudFrontInfoPath | ConvertFrom-Json
    $DistId = $CloudFrontInfo.DistributionId
    
    Write-Host "`n🔄 Invalidating CloudFront cache..." -ForegroundColor Yellow
    aws cloudfront create-invalidation --distribution-id $DistId --paths "/*" | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ CloudFront cache invalidated!" -ForegroundColor Green
        Write-Host "`n🌐 Website: https://$($CloudFrontInfo.DomainName)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  CloudFront invalidation failed (có thể do thiếu quyền)" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️  CloudFront chưa được setup. Website có sẵn tại:" -ForegroundColor Yellow
    Write-Host "   http://$BucketName.s3-website-ap-southeast-1.amazonaws.com" -ForegroundColor Cyan
}

Write-Host "`n✨ Deploy hoàn tất!" -ForegroundColor Green
Set-Location ..\..
