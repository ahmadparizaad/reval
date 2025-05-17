# PowerShell script to test the leaderboard API endpoints

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "       REVAL API TESTING SCRIPT        " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$endpoints = @(
    "/api/health",
    "/api/leaderboard",
    "/api/ranking"
)

# Function to test an API endpoint
function Test-Endpoint {
    param (
        [string]$Endpoint
    )
    
    $url = $baseUrl + $Endpoint
    
    Write-Host "Testing endpoint: " -NoNewline
    Write-Host $url -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing
        
        # Display status
        Write-Host "Status: " -NoNewline
        Write-Host "$($response.StatusCode) - $($response.StatusDescription)" -ForegroundColor Green
        
        # Display content type
        Write-Host "Content-Type: $($response.Headers.'Content-Type')"
        
        # Parse and display response
        $content = $response.Content
        try {
            $json = $content | ConvertFrom-Json
            Write-Host "Response parsed successfully" -ForegroundColor Green
            
            # Display a preview of the JSON response
            $jsonString = $json | ConvertTo-Json -Depth 3
            if ($jsonString.Length -gt 500) {
                Write-Host ($jsonString.Substring(0, 500) + "...") -ForegroundColor Gray
            } else {
                Write-Host $jsonString -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "Failed to parse JSON response" -ForegroundColor Red
            Write-Host $content.Substring(0, [Math]::Min($content.Length, 200)) -ForegroundColor Red
        }
    }
    catch {
        Write-Host "Error connecting to endpoint: $_" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "---------------------------------------"
    Write-Host ""
}

# Main script
Write-Host "Starting API tests..." -ForegroundColor Blue
Write-Host ""

foreach ($endpoint in $endpoints) {
    Test-Endpoint -Endpoint $endpoint
    Start-Sleep -Seconds 1
}

Write-Host "All tests completed!" -ForegroundColor Cyan
