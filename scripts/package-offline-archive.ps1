# Project COSMOS — Portable Offline Archive Packager (Phase 6)
# Fast, clean packaging of all source code, standalone 3D WebGL HTML simulator,
# Fun Space Corp secp384r1 mTLS certs, Manifest V3 Chrome Extension, and test suite.

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$ZipPath = Join-Path $RootDir "cosmos-portable-offline-archive.zip"
$StagingDir = Join-Path $RootDir ".staging_archive"

Write-Host "Preparing Project COSMOS Portable Offline Archive..." -ForegroundColor Cyan

if (Test-Path $StagingDir) {
    Remove-Item -Recurse -Force $StagingDir
}
if (Test-Path $ZipPath) {
    Remove-Item -Force $ZipPath
}

New-Item -ItemType Directory -Path $StagingDir | Out-Null

# Also copy cosmos-webgl-simulator.html to starlink-constellation-webgl.html
Copy-Item (Join-Path $RootDir "cosmos-webgl-simulator.html") -Destination (Join-Path $RootDir "starlink-constellation-webgl.html") -Force

# 1. Copy root files including standalone WebGL simulators
$RootFiles = @(
    "cosmos-webgl-simulator.html",
    "starlink-constellation-webgl.html",
    "package.json",
    "turbo.json",
    "tsconfig.json",
    "docker-compose.yml",
    ".env.example",
    "README.md"
)
foreach ($file in $RootFiles) {
    $src = Join-Path $RootDir $file
    if (Test-Path $src) {
        Copy-Item $src -Destination $StagingDir
    }
}

# 2. Copy certs/, chrome-extension/, and tests/
foreach ($dir in @("certs", "chrome-extension", "tests")) {
    $srcDir = Join-Path $RootDir $dir
    if (Test-Path $srcDir) {
        Copy-Item $srcDir -Destination (Join-Path $StagingDir $dir) -Recurse
    }
}

# 3. Copy packages/types and packages/orbital
foreach ($pkg in @("types", "orbital")) {
    $destPkg = Join-Path $StagingDir "packages\$pkg"
    New-Item -ItemType Directory -Path $destPkg -Force | Out-Null
    Copy-Item (Join-Path $RootDir "packages\$pkg\package.json") -Destination $destPkg
    Copy-Item (Join-Path $RootDir "packages\$pkg\tsconfig.json") -Destination $destPkg
    Copy-Item (Join-Path $RootDir "packages\$pkg\src") -Destination (Join-Path $destPkg "src") -Recurse
}

# 4. Copy apps/api
$destApi = Join-Path $StagingDir "apps\api"
New-Item -ItemType Directory -Path $destApi -Force | Out-Null
foreach ($f in @("package.json", "tsconfig.json", "Dockerfile")) {
    $p = Join-Path $RootDir "apps\api\$f"
    if (Test-Path $p) { Copy-Item $p -Destination $destApi }
}
Copy-Item (Join-Path $RootDir "apps\api\src") -Destination (Join-Path $destApi "src") -Recurse

# 5. Copy apps/web (excluding public/cesium and .next)
$destWeb = Join-Path $StagingDir "apps\web"
New-Item -ItemType Directory -Path $destWeb -Force | Out-Null
foreach ($f in @("package.json", "tsconfig.json", "next.config.js", "tailwind.config.ts", "postcss.config.js", "Dockerfile")) {
    $p = Join-Path $RootDir "apps\web\$f"
    if (Test-Path $p) { Copy-Item $p -Destination $destWeb }
}
Copy-Item (Join-Path $RootDir "apps\web\src") -Destination (Join-Path $destWeb "src") -Recurse

# 6. Copy scripts/
$destScripts = Join-Path $StagingDir "scripts"
New-Item -ItemType Directory -Path $destScripts -Force | Out-Null
Copy-Item (Join-Path $RootDir "scripts\*") -Destination $destScripts

# Compress to portable zip archive
Compress-Archive -Path "$StagingDir\*" -DestinationPath $ZipPath -Force
Remove-Item -Recurse -Force $StagingDir

$ZipInfo = Get-Item $ZipPath
Write-Host "Successfully created portable archive: $($ZipInfo.FullName) ($([math]::Round($ZipInfo.Length / 1KB, 1)) KB)" -ForegroundColor Green
