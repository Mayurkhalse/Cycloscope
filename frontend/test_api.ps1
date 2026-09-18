# Cycloscope End-to-End API Test Runner

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "    CYCLOSCOPE AUTOMATED API INTEGRATION TEST  " -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$backendUrl = "http://localhost:5000/api"
$mlUrl = "http://localhost:8000"
$cycloneId = "IO_2026_TEST"
$sessionId = "test-session-001"

function Test-Endpoint {
    param(
        [string]$StepName,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null
    )

    Write-Host "[$StepName] $Method $Url ... " -NoNewline -ForegroundColor Yellow

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 5
        }
        if ($Body) {
            $params["Body"] = $Body
            $params["ContentType"] = "application/json"
        }

        $response = Invoke-RestMethod @params
        Write-Host "PASS (200 OK)" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "FAIL ($($_.Exception.Message))" -ForegroundColor Red
        return $null
    }
}

# Step 0: ML Health
$mlHealth = Test-Endpoint -StepName "Step 0: ML Service Health" -Method "Get" -Url "$mlUrl/health"

# Step 1: Backend Health
$backHealth = Test-Endpoint -StepName "Step 1: Backend & DB Health" -Method "Get" -Url "$backendUrl/system/health"

# Step 2: Backend ML Status
$mlStatus = Test-Endpoint -StepName "Step 2: Backend ML Connectivity" -Method "Get" -Url "$backendUrl/system/ml-status"

# Step 4a: Trigger Prediction Refresh
$predRefresh = Test-Endpoint -StepName "Step 4a: Trigger Prediction Refresh" -Method "Post" -Url "$backendUrl/predictions/$cycloneId/refresh"

# Step 4b: Get Latest Prediction
$predLatest = Test-Endpoint -StepName "Step 4b: Read Latest Prediction" -Method "Get" -Url "$backendUrl/predictions/$cycloneId/latest"

# Step 6a: Fetch Active Cyclones
$activeCyclones = Test-Endpoint -StepName "Step 6a: Fetch Active Cyclones" -Method "Get" -Url "$backendUrl/cyclones/active"

# Step 7a: Send Chatbot Message
$chatBody = @{ message = "What is the status of the test storm in Bay of Bengal?" } | ConvertTo-Json
$chatMsg = Test-Endpoint -StepName "Step 7a: RAG Chatbot Query" -Method "Post" -Url "$backendUrl/chat/$sessionId/message" -Body $chatBody

# Step 7b: Fetch Chatbot History
$chatHist = Test-Endpoint -StepName "Step 7b: RAG Chatbot History" -Method "Get" -Url "$backendUrl/chat/$sessionId/history"

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "              TEST SUITE COMPLETED             " -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan
