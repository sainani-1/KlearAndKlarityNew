Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Common -ErrorAction SilentlyContinue

$root = "D:\HTI PROJECT @ Copy"
$logoPath = Join-Path $root "All Needed\Logo.jpeg"
$resDir = Join-Path $root "frontend\resources"
$brand = [System.Drawing.ColorTranslator]::FromHtml("#1d4ed8")

$logo = [System.Drawing.Image]::FromFile($logoPath)

function New-Canvas([int]$w, [int]$h, [System.Drawing.Color]$bg) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear($bg)
    return @($bmp, $g)
}

function Draw-LogoCentered($g, $logo, [int]$w, [int]$h, [double]$fillFraction) {
    $maxW = $w * $fillFraction
    $maxH = $h * $fillFraction
    $scale = [Math]::Min($maxW / $logo.Width, $maxH / $logo.Height)
    $dw = [int]($logo.Width * $scale)
    $dh = [int]($logo.Height * $scale)
    $x = [int](($w - $dw) / 2)
    $y = [int](($h - $dh) / 2)
    $g.DrawImage($logo, $x, $y, $dw, $dh)
}

# 1) App icon 1024x1024: logo on blue background
$c = New-Canvas 1024 1024 $brand
Draw-LogoCentered $c[1] $logo 1024 1024 0.72
$c[0].Save((Join-Path $resDir "icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$c[1].Dispose(); $c[0].Dispose()

# 2) Icon foreground 1024x1024: logo on transparent, padded for Android adaptive mask
$bmp = New-Object System.Drawing.Bitmap(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::Transparent)
Draw-LogoCentered $g $logo 1024 1024 0.55
$bmp.Save((Join-Path $resDir "icon-foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# 3) Icon background 1024x1024: solid brand color
$c = New-Canvas 1024 1024 $brand
$c[0].Save((Join-Path $resDir "icon-background.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$c[1].Dispose(); $c[0].Dispose()

# 4) Splash 2732x2732: logo on blue background
$c = New-Canvas 2732 2732 $brand
Draw-LogoCentered $c[1] $logo 2732 2732 0.30
$c[0].Save((Join-Path $resDir "splash.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$c[1].Dispose(); $c[0].Dispose()

# 5) Splash dark 2732x2732
$c = New-Canvas 2732 2732 $brand
Draw-LogoCentered $c[1] $logo 2732 2732 0.30
$c[0].Save((Join-Path $resDir "splash-dark.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$c[1].Dispose(); $c[0].Dispose()

$logo.Dispose()
Get-ChildItem $resDir | Select-Object Name, Length
