# Add ngrok to PATH permanently
# Run this script as Administrator: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\scripts\add-ngrok-to-path.ps1

$userProfile = [Environment]::GetFolderPath("UserProfile")
$ngrokDir = Join-Path $userProfile "ngrok"
$ngrokExe = Join-Path $ngrokDir "ngrok.exe"

if (-not (Test-Path $ngrokExe)) {
    Write-Host "❌ ngrok.exe not found at: $ngrokExe"
    Write-Host "Please install ngrok first!"
    exit 1
}

# Get current user PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

# Check if ngrok is already in PATH
if ($currentPath -like "*$ngrokDir*") {
    Write-Host "✅ ngrok is already in PATH"
} else {
    # Add to PATH
    $newPath = $currentPath + ";$ngrokDir"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "✅ Added ngrok to PATH: $ngrokDir"
    Write-Host "⚠️  You may need to restart your terminal for changes to take effect"
}

Write-Host "`n📍 ngrok location: $ngrokExe"
Write-Host "📋 To test: ngrok version"

