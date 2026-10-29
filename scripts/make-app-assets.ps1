Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Common -ErrorAction SilentlyContinue

# Resolve the repo root from this script's location (scripts\ -> repo root).
$root = Split-Path -Parent $PSScriptRoot
$logoPath = Join-Path $root "All Needed\Logo.jpeg"
$resDir = Join-Path $root "frontend\resources"

# "Aurora" palette — matches frontend\src\index.css.
$brand = [System.Drawing.ColorTranslator]::FromHtml("#4f46e5")   # indigo-600
$midnightA = [System.Drawing.ColorTranslator]::FromHtml("#0a0e2c")
$midnightB = [System.Drawing.ColorTranslator]::FromHtml("#1c2456")
$accent = [System.Drawing.ColorTranslator]::FromHtml("#22d3ee")

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

function New-GradientCanvas([int]$w, [int]$h, [System.Drawing.Color]$a, [System.Drawing.Color]$b) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $a, $b, 45.0)
    $g.FillRectangle($brush, $rect)
    return @($bmp, $g, $brush)
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

# 1) App icon 1024x1024: logo on the new brand background.
$c = New-Canvas 1024 1024 $brand
Draw-LogoCentered $c[1] $logo 1024 1024 0.72
$c[0].Save((Join-Path $resDir "icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$c[1].Dispose(); $c[0].Dispose()

# 2) Icon foreground 1024x1024: logo on transparent, padded for Android adaptive mask.
$bmp = New-Object System.Drawing.Bitmap(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::Transparent)
Draw-LogoCentered $g $logo 1024 1024 0.55
$bmp.Save((Join-Path $resDir "icon-foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# 3) Icon background 1024x1024: solid new brand color.
$c = New-Canvas 1024 1024 $brand
$c[0].Save((Join-Path $resDir "icon-background.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$c[1].Dispose(); $c[0].Dispose()

# 4) Splash 2732x2732: logo on the new midnight aurora gradient.
$c = New-GradientCanvas 2732 2732 $midnightA $midnightB
Draw-LogoCentered $c[1] $logo 2732 2732 0.30
$c[0].Save((Join-Path $resDir "splash.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$c[2].Dispose(); $c[1].Dispose(); $c[0].Dispose()

# 5) Splash dark 2732x2732: same midnight gradient.
$c = New-GradientCanvas 2732 2732 $midnightA $midnightB
Draw-LogoCentered $c[1] $logo 2732 2732 0.30
$c[0].Save((Join-Path $resDir "splash-dark.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$c[2].Dispose(); $c[1].Dispose(); $c[0].Dispose()

$logo.Dispose()
Get-ChildItem $resDir | Select-Object Name, Length
