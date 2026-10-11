param([string]$In, [string]$OutDir, [string]$Slides)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $OutDir | Out-Null
$pp = New-Object -ComObject PowerPoint.Application
try {
  $pres = $pp.Presentations.Open($In, $true, $false, $false)
  "size: $($pres.PageSetup.SlideWidth) x $($pres.PageSetup.SlideHeight) pt, slides: $($pres.Slides.Count)"
  $list = if ($Slides) { $Slides -split ',' | ForEach-Object { [int]$_ } } else { 1..$pres.Slides.Count }
  foreach ($i in $list) {
    $sld = $pres.Slides.Item($i)
    $sld.Export((Join-Path $OutDir ("t-{0:D2}.png" -f $i)), 'PNG', 1280, [int](1280 * $pres.PageSetup.SlideHeight / $pres.PageSetup.SlideWidth))
  }
  $pres.Close()
} finally { $pp.Quit() }
