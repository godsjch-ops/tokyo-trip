param([string]$In, [string]$Out, [string]$PngDir)
$ErrorActionPreference = 'Stop'
$pp = New-Object -ComObject PowerPoint.Application
try {
  $pres = $pp.Presentations.Open($In, $false, $false, $false)  # ReadOnly, Untitled, WithWindow
  # Korean: wrap at word boundaries instead of mid-word (PowerPoint's "한글 단어 잘림 허용" off)
  $ww = 0
  foreach ($sld in $pres.Slides) {
    foreach ($shp in $sld.Shapes) {
      if ($shp.HasTextFrame) { $shp.TextFrame2.TextRange.ParagraphFormat.WordWrap = 0; $ww++ }
      if ($shp.HasTable) {
        $t = $shp.Table
        for ($r = 1; $r -le $t.Rows.Count; $r++) { for ($c = 1; $c -le $t.Columns.Count; $c++) {
          $t.Cell($r, $c).Shape.TextFrame2.TextRange.ParagraphFormat.WordWrap = 0 } }
      }
    }
  }
  "word-wrap set on $ww text shapes"
  foreach ($sld in $pres.Slides) {
    foreach ($shp in $sld.Shapes) {
      if ($shp.Type -eq 16) {  # msoMedia
        $ps = $shp.AnimationSettings.PlaySettings
        $ps.PlayOnEntry = -1
        $ps.LoopUntilStopped = -1
        $ps.HideWhileNotPlaying = 0
        $ps.RewindMovie = -1
        # make the play effect start with the slide instead of on click
        $seq = $sld.TimeLine.MainSequence
        for ($i = 1; $i -le $seq.Count; $i++) {
          $e = $seq.Item($i)
          if ($e.Shape.Name -eq $shp.Name) { $e.Timing.TriggerType = 2 }  # msoAnimTriggerWithPrevious
        }
        "slide $($sld.SlideIndex): $($shp.Name) autoplay+loop, effects=$($seq.Count)"
      }
    }
  }
  $pres.SaveAs($Out)
  if ($PngDir) {
    New-Item -ItemType Directory -Force $PngDir | Out-Null
    Get-ChildItem $PngDir -Filter *.png | Remove-Item -Force
    foreach ($sld in $pres.Slides) { $sld.Export((Join-Path $PngDir ("slide-{0:D2}.png" -f $sld.SlideIndex)), 'PNG', 1600, 900) }
  }
  $pres.Close()
} finally { $pp.Quit() }
