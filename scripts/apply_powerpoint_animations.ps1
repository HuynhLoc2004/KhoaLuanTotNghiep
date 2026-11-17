# PowerShell script to apply professional transitions and animations to all 20 slides
$ErrorActionPreference = "Stop"

$pptPath = "d:\KhoaluanTotNghiep\BaoCao_KhoaLuanTotNghiep_BaoTangLichSu360.pptx"

Write-Output "Connecting to PowerPoint COM..."
$ppt = New-Object -ComObject PowerPoint.Application

Write-Output "Opening presentation: $pptPath"
$pres = $ppt.Presentations.Open($pptPath, $false, $false, $false)

# Constants
$ppEffectFade = 769
$msoAnimEffectFade = 10
$msoAnimEffectFly = 2
$msoAnimEffectZoom = 23
$msoAnimEffectWipe = 22
$msoAnimTriggerOnPageClick = 1
$msoAnimTriggerWithPrevious = 2
$msoAnimTriggerAfterPrevious = 3

Write-Output "Total slides found: $($pres.Slides.Count)"

for ($sIdx = 1; $sIdx -le $pres.Slides.Count; $sIdx++) {
    $slide = $pres.Slides.Item($sIdx)
    
    # 1. Slide Transition: Smooth Fade
    $slide.SlideShowTransition.EntryEffect = $ppEffectFade
    $slide.SlideShowTransition.Duration = 0.5
    
    # 2. MainSequence animations
    $seq = $slide.TimeLine.MainSequence
    
    # Clear existing effects if any
    while ($seq.Count -gt 0) {
        $seq.Item(1).Delete()
    }
    
    $shapeCount = $slide.Shapes.Count
    if ($shapeCount -ge 2) {
        # Determine shapes to animate (skip background rectangle at index 1)
        # Animate key content shapes with smooth entrance
        $targetShapes = @()
        for ($i = 2; $i -le $shapeCount; $i++) {
            $sh = $slide.Shapes.Item($i)
            # Skip divider lines and tiny decoration shapes
            if ($sh.Width -gt 50 -and $sh.Height -gt 20) {
                $targetShapes += $sh
            }
        }
        
        $first = $true
        foreach ($sh in $targetShapes) {
            if ($first) {
                # First content shape appears on page click / start
                $eff = $seq.AddEffect($sh, $msoAnimEffectFade, 0, $msoAnimTriggerWithPrevious)
                $eff.Timing.Duration = 0.4
                $first = $false
            } else {
                # Subsequent shapes animate sequentially
                $eff = $seq.AddEffect($sh, $msoAnimEffectFade, 0, $msoAnimTriggerAfterPrevious)
                $eff.Timing.Duration = 0.25
                $eff.Timing.TriggerDelayTime = 0.05
            }
        }
    }
    Write-Output "Slide ${sIdx}: Transition & Animations applied ($($seq.Count) effects)"
}

Write-Output "Saving presentation..."
$pres.Save()
$pres.Close()
$ppt.Quit()

[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()

Write-Output "All 20 slides successfully updated with PowerPoint transitions and animations!"
