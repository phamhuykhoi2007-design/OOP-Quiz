# Server du phong bang PowerShell (khi may khong co Python).
# Chay: powershell -NoProfile -ExecutionPolicy Bypass -File server.ps1
# Thu cong 8000 truoc; neu bi chiem thi tu lui 8001..8009.
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$mime = @{
  ".html" = "text/html"
  ".js"   = "application/javascript"
  ".css"  = "text/css"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".ico"  = "image/x-icon"
  ".txt"  = "text/plain"
  ".md"   = "text/plain"
  ".json" = "application/json"
}

$hl = $null
$chosen = $null
foreach ($port in 8000..8009) {
  try {
    $h = New-Object System.Net.HttpListener
    $h.Prefixes.Add("http://localhost:$port/")
    $h.Start()
    $hl = $h
    $chosen = $port
    break
  } catch { }
}

if (-not $hl) {
  Write-Host "KHONG mo duoc cong nao 8000-8009." -ForegroundColor Red
  Write-Host "(Cac cong nay co the dang bi chuong trinh khac chiem.)"
  Read-Host "Nhan Enter de thoat"
  exit 1
}

Write-Host ("OOP Quiz dang chay tai http://localhost:" + $chosen) -ForegroundColor Cyan
Write-Host "Nhan Ctrl+C (hoac dong cua so) de tat."

while ($hl.IsListening) {
  try {
    $ctx = $hl.GetContext()
    $path = $ctx.Request.Url.AbsolutePath.TrimStart("/")
    if ($path -eq "") { $path = "index.html" }
    $path = $path.Replace("/", "\")
    $file = Join-Path $root $path

    if ([System.IO.File]::Exists($file)) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      if (-not $mime.ContainsKey($ext)) { $ext = ".txt" }
      $ctx.Response.ContentType = $mime[$ext]
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    Write-Host ("Loi: " + $_.Exception.Message) -ForegroundColor Yellow
  }
}
