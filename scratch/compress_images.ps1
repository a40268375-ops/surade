Add-Type -AssemblyName System.Drawing

$frontendDir = "c:\Project\Info.co.id\frontend\public\images\businesses"
$backendDir = "c:\Project\Info.co.id\backend\storage\app\public\businesses"

$files = Get-ChildItem -Path $frontendDir -Filter "*.jpg"

function Compress-Image ($sourcePath, $destPath, $maxWidth, $maxHeight, $quality) {
    try {
        $img = [System.Drawing.Image]::FromFile($sourcePath)
        $ratioX = $maxWidth / $img.Width
        $ratioY = $maxHeight / $img.Height
        $ratio = [System.Math]::Min($ratioX, $ratioY)
        if ($ratio -gt 1.0) { $ratio = 1.0 }

        $newWidth = [int]($img.Width * $ratio)
        $newHeight = [int]($img.Height * $ratio)

        $bmp = New-Object System.Drawing.Bitmap $newWidth, $newHeight
        $graph = [System.Drawing.Graphics]::FromImage($bmp)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)

        $img.Dispose()

        # JPEG encoder
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)

        $tempFile = $sourcePath + ".tmp"
        $bmp.Save($tempFile, $codec, $encoderParams)

        $graph.Dispose()
        $bmp.Dispose()

        Move-Item -Path $tempFile -Destination $destPath -Force
        return $true
    } catch {
        Write-Host "Failed to compress $sourcePath : $_"
        return $false
    }
}

Write-Host "Compressing $($files.Count) business images..."

foreach ($f in $files) {
    $isBanner = $f.Name -match "banner"
    $maxWidth = if ($isBanner) { 800 } else { 400 }
    $maxHeight = if ($isBanner) { 500 } else { 400 }
    $quality = if ($isBanner) { 75 } else { 80 }

    $destBackend = Join-Path $backendDir $f.Name
    Compress-Image $f.FullName $f.FullName $maxWidth $maxHeight $quality
    Copy-Item -Path $f.FullName -Destination $destBackend -Force
    $newSize = (Get-Item $f.FullName).Length / 1024
    Write-Host ("Compressed: " + $f.Name + " -> " + [math]::Round($newSize, 1) + " KB")
}

Write-Host "Semua gambar berhasil dikompresi!"
