# PowerShell script to run the server and test the endpoints
# Filename: test-server.ps1

$ErrorActionPreference = "Stop"

# Define colors for output
function Write-ColorOutput {
    param (
        [Parameter(Mandatory = $true)]
        [string]$Text,
        
        [Parameter(Mandatory = $false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host $Text -ForegroundColor $ForegroundColor
}

Write-ColorOutput "====================================" "Cyan"
Write-ColorOutput "  REVAL SERVER TEST & DIAGNOSTICS   " "Cyan"
Write-ColorOutput "====================================" "Cyan"
Write-ColorOutput ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-ColorOutput "Node.js version: $nodeVersion" "Green"
} catch {
    Write-ColorOutput "❌ Node.js is not installed or not in PATH!" "Red"
    exit 1
}

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [Parameter(Mandatory = $true)]
        [int]$Port
    )
    
    $connections = netstat -ano | Select-String -Pattern "TCP.*:$Port\s"
    return ($null -ne $connections)
}

# Check if ports are available
$nextPort = 3000
$backendPort = 5000

if (Test-PortInUse -Port $nextPort) {
    Write-ColorOutput "⚠️ Port $nextPort is already in use. Next.js might not start correctly." "Yellow"
} else {
    Write-ColorOutput "✅ Port $nextPort is available for Next.js." "Green"
}

if (Test-PortInUse -Port $backendPort) {
    Write-ColorOutput "⚠️ Port $backendPort is already in use. Backend server might not start correctly." "Yellow"
} else {
    Write-ColorOutput "✅ Port $backendPort is available for the backend server." "Green"
}

Write-ColorOutput ""
Write-ColorOutput "Starting Next.js development server..." "Blue"
Write-ColorOutput ""

# Start the Next.js server in the background
$nextProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow

# Wait for the server to start (adjust wait time as needed)
Write-ColorOutput "Waiting for Next.js server to start up..." "Yellow"
Start-Sleep -Seconds 10

# Check if the Next.js server is running
if ((Test-NetConnection localhost -Port $nextPort -ErrorAction SilentlyContinue).TcpTestSucceeded) {
    Write-ColorOutput "✅ Next.js server is running on port $nextPort" "Green"
    
    # Wait a bit more to ensure all routes are loaded
    Start-Sleep -Seconds 3
    
    # Run the API tests
    Write-ColorOutput ""
    Write-ColorOutput "Running API endpoint tests..." "Blue"
    Write-ColorOutput ""
    
    # Run the test script
    node src/scripts/test-api.js
    
    # Wait for user input before exiting
    Write-ColorOutput ""
    Write-ColorOutput "Press any key to stop the server and exit..." "Cyan"
    $null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Stop the Next.js server
    Stop-Process -Id $nextProcess.Id -Force
} else {
    Write-ColorOutput "❌ Failed to start Next.js server on port $nextPort" "Red"
}

Write-ColorOutput ""
Write-ColorOutput "Test completed." "Cyan"
