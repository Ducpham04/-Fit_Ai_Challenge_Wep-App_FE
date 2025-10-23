# Script để setup CloudFront cho S3 static website
# Chạy script này với AWS user có quyền CloudFront

$BucketName = "fit-ai-challenge-frontend"
$Region = "ap-southeast-1"

Write-Host "=== Setup CloudFront Distribution ===" -ForegroundColor Cyan

# Bước 1: Tạo OAI (Origin Access Identity)
Write-Host "`n1. Tạo CloudFront Origin Access Identity..." -ForegroundColor Yellow
$CallerRef = Get-Date -Format "yyyyMMddHHmmss"
$OAI = aws cloudfront create-cloud-front-origin-access-identity --cloud-front-origin-access-identity-config "{`"CallerReference`":`"$CallerRef`",`"Comment`":`"OAI for $BucketName`"}" | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    $OAIId = $OAI.CloudFrontOriginAccessIdentity.Id
    $OAICanonicalUserId = $OAI.CloudFrontOriginAccessIdentity.S3CanonicalUserId
    Write-Host "   ✓ OAI created: $OAIId" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed to create OAI. Bạn cần AWS user có quyền CloudFront!" -ForegroundColor Red
    exit 1
}

# Bước 2: Cập nhật S3 bucket policy
Write-Host "`n2. Cập nhật S3 bucket policy..." -ForegroundColor Yellow
$BucketPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFrontReadGetObject",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity $OAIId"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BucketName/*"
    }
  ]
}
"@

$BucketPolicy | Out-File -FilePath "bucket-policy-cloudfront.json" -Encoding utf8
aws s3api put-bucket-policy --bucket $BucketName --policy file://bucket-policy-cloudfront.json

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Bucket policy updated" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed to update bucket policy" -ForegroundColor Red
}

# Bước 3: Tắt website hosting (không cần nữa vì dùng CloudFront)
Write-Host "`n3. Tắt S3 website hosting..." -ForegroundColor Yellow
aws s3api delete-bucket-website --bucket $BucketName
Write-Host "   ✓ Website hosting disabled" -ForegroundColor Green

# Bước 4: Tạo CloudFront distribution
Write-Host "`n4. Tạo CloudFront distribution..." -ForegroundColor Yellow
$DistConfig = @"
{
  "CallerReference": "$CallerRef-dist",
  "Comment": "CDN for $BucketName",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BucketName",
        "DomainName": "$BucketName.s3.$Region.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/$OAIId"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BucketName",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      },
      "Headers": {
        "Quantity": 0
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "PriceClass": "PriceClass_100"
}
"@

$DistConfig | Out-File -FilePath "cloudfront-dist-config.json" -Encoding utf8
$Distribution = aws cloudfront create-distribution --distribution-config file://cloudfront-dist-config.json | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    $DistId = $Distribution.Distribution.Id
    $DomainName = $Distribution.Distribution.DomainName
    Write-Host "   ✓ CloudFront distribution created!" -ForegroundColor Green
    Write-Host "`n=== THÀNH CÔNG! ===" -ForegroundColor Green
    Write-Host "Distribution ID: $DistId" -ForegroundColor Cyan
    Write-Host "Domain Name: $DomainName" -ForegroundColor Cyan
    Write-Host "`nWebsite của bạn sẽ có sẵn tại: https://$DomainName" -ForegroundColor Yellow
    Write-Host "(Cần đợi 5-15 phút để CloudFront distribution được deploy)" -ForegroundColor Yellow
    
    # Lưu thông tin để dùng sau
    @{
        DistributionId = $DistId
        DomainName = $DomainName
        OAIId = $OAIId
    } | ConvertTo-Json | Out-File -FilePath "cloudfront-info.json" -Encoding utf8
    
} else {
    Write-Host "   ✗ Failed to create distribution" -ForegroundColor Red
}

Write-Host "`n=== Hoàn tất! ===" -ForegroundColor Cyan
