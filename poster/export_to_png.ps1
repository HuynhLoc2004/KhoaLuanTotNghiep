$ErrorActionPreference = 'Stop'
$ppt = New-Object -ComObject PowerPoint.Application
$pptFile = (Resolve-Path "poster/POSTER_KLTN_BaoTang360_IUH.pptx").Path
$outFile = (Join-Path (Get-Location) "poster/POSTER_KLTN_BaoTang360_IUH.png")
$pdfFile = (Join-Path (Get-Location) "poster/POSTER_KLTN_BaoTang360_IUH.pdf")
$pres = $ppt.Presentations.Open($pptFile, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$slide = $pres.Slides.Item(1)
$slide.Export($outFile, "PNG", 2400, 3393)
try {
    $pres.SaveAs($pdfFile, 32)
    Write-Host "Export PDF success: $pdfFile"
} catch {
    Write-Host "PDF export skipped or failed: $_"
}
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "Export PNG success: $outFile"
