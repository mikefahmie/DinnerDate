# safe-batch-process.ps1 - Process all photos in safe batches

$anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
$base_url = "http://localhost:54321/functions/v1/fetch-restaurant-photos"
$batch_size = 25  # Conservative batch size
$max_batches = 20  # Adjust based on your restaurant count
$delay_between_batches = 10  # seconds

Write-Host "🚀 Starting safe batch photo processing..." -ForegroundColor Green
Write-Host "Batch size: $batch_size" -ForegroundColor Yellow
Write-Host "Delay between batches: $delay_between_batches seconds" -ForegroundColor Yellow

$total_processed = 0
$total_failed = 0
$total_skipped = 0

for ($i = 1; $i -le $max_batches; $i++) {
    Write-Host "`n📦 Processing batch $i of $max_batches..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod `
            -Uri $base_url `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $anon_key"
                "Content-Type" = "application/json"
            } `
            -Body "{`"batchSize`": $batch_size}"
        
        if ($response.success) {
            $processed = $response.results.processed
            $failed = $response.results.failed
            $skipped = $response.results.skipped
            
            $total_processed += $processed
            $total_failed += $failed
            $total_skipped += $skipped
            
            Write-Host "  ✅ Batch $i completed:" -ForegroundColor Green
            Write-Host "     Processed: $processed" -ForegroundColor Green
            Write-Host "     Failed: $failed" -ForegroundColor Red
            Write-Host "     Skipped: $skipped" -ForegroundColor Yellow
            
            # If no restaurants were processed, we're probably done
            if ($processed -eq 0 -and $skipped -eq 0) {
                Write-Host "  🏁 No more restaurants to process. Stopping." -ForegroundColor Blue
                break
            }
        } else {
            Write-Host "  ❌ Batch $i failed: $($response.error)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "  ❌ Batch $i error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Wait between batches (except for the last one)
    if ($i -lt $max_batches) {
        Write-Host "  ⏳ Waiting $delay_between_batches seconds before next batch..." -ForegroundColor Gray
        Start-Sleep -Seconds $delay_between_batches
    }
}

Write-Host "`n🎉 Batch processing completed!" -ForegroundColor Green
Write-Host "📊 Final Results:" -ForegroundColor Blue
Write-Host "   Total Processed: $total_processed" -ForegroundColor Green
Write-Host "   Total Failed: $total_failed" -ForegroundColor Red
Write-Host "   Total Skipped: $total_skipped" -ForegroundColor Yellow